create table if not exists public.sdm_admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.sdm_app_state (
  key text primary key,
  data jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now(),
  constraint sdm_app_state_valid_key check (
    key in (
      'sdm_gear_inventory',
      'sdm_orders',
      'sdm_updates',
      'sdm_customer_profiles',
      'sdm_quotations',
      'sdm_partners',
      'sdm_media_config'
    )
  ),
  constraint sdm_app_state_json_size check (pg_column_size(data) <= 5000000)
);

create table if not exists public.sdm_quote_requests (
  id text primary key,
  payload jsonb not null,
  customer_phone text not null,
  created_at timestamptz not null default now(),
  constraint sdm_quote_requests_json_size check (pg_column_size(payload) <= 100000)
);

create index if not exists sdm_quote_requests_created_at_idx
  on public.sdm_quote_requests (created_at desc);
create index if not exists sdm_quote_requests_customer_phone_idx
  on public.sdm_quote_requests (customer_phone, created_at desc);

alter table public.sdm_admin_users enable row level security;
alter table public.sdm_app_state enable row level security;
alter table public.sdm_quote_requests enable row level security;

revoke all on public.sdm_admin_users from anon, authenticated;
revoke all on public.sdm_app_state from anon, authenticated;
revoke all on public.sdm_quote_requests from anon, authenticated;
grant select, insert, update on public.sdm_app_state to authenticated;
grant select, insert, update on public.sdm_quote_requests to authenticated;

drop policy if exists "Admins can read app state" on public.sdm_app_state;
drop policy if exists "Admins can insert app state" on public.sdm_app_state;
drop policy if exists "Admins can update app state" on public.sdm_app_state;
drop policy if exists "Admins can read quote requests" on public.sdm_quote_requests;
drop policy if exists "Admins can insert quote requests" on public.sdm_quote_requests;
drop policy if exists "Admins can update quote requests" on public.sdm_quote_requests;

create or replace function public.sdm_is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.sdm_admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.sdm_is_admin() from public, anon;
grant execute on function public.sdm_is_admin() to authenticated;

create policy "Admins can read app state"
  on public.sdm_app_state for select to authenticated
  using ((select public.sdm_is_admin()));
create policy "Admins can insert app state"
  on public.sdm_app_state for insert to authenticated
  with check ((select public.sdm_is_admin()));
create policy "Admins can update app state"
  on public.sdm_app_state for update to authenticated
  using ((select public.sdm_is_admin()))
  with check ((select public.sdm_is_admin()));
create policy "Admins can read quote requests"
  on public.sdm_quote_requests for select to authenticated
  using ((select public.sdm_is_admin()));
create policy "Admins can insert quote requests"
  on public.sdm_quote_requests for insert to authenticated
  with check ((select public.sdm_is_admin()));
create policy "Admins can update quote requests"
  on public.sdm_quote_requests for update to authenticated
  using ((select public.sdm_is_admin()))
  with check ((select public.sdm_is_admin()));

create or replace function public.sdm_get_public_state()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'sdm_gear_inventory',
      coalesce((select data from public.sdm_app_state where key = 'sdm_gear_inventory'), '[]'::jsonb),
    'sdm_updates',
      coalesce((
        select jsonb_agg(post order by post->>'createdAt' desc)
        from public.sdm_app_state state
        cross join lateral jsonb_array_elements(state.data) post
        where state.key = 'sdm_updates' and post->>'published' = 'true'
      ), '[]'::jsonb),
    'sdm_partners',
      coalesce((
        select jsonb_agg(partner order by (partner->>'displayOrder')::integer)
        from public.sdm_app_state state
        cross join lateral jsonb_array_elements(state.data) partner
        where state.key = 'sdm_partners' and partner->>'active' = 'true'
      ), '[]'::jsonb),
    'sdm_media_config',
      (select data from public.sdm_app_state where key = 'sdm_media_config')
  );
$$;

revoke all on function public.sdm_get_public_state() from public;
grant execute on function public.sdm_get_public_state() to anon, authenticated;

create or replace function public.sdm_save_app_state(
  p_key text,
  p_data jsonb,
  p_expected_revision bigint
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_revision bigint;
begin
  if not (select public.sdm_is_admin()) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if p_key not in (
    'sdm_gear_inventory',
    'sdm_orders',
    'sdm_updates',
    'sdm_customer_profiles',
    'sdm_quotations',
    'sdm_partners',
    'sdm_media_config'
  ) then
    raise exception 'Unsupported state key' using errcode = '22023';
  end if;
  if p_data is null or pg_column_size(p_data) > 5000000 then
    raise exception 'Invalid or oversized state payload' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(74613820);
  insert into public.sdm_app_state as current_state (key, data, revision, updated_at)
  values (p_key, p_data, 1, now())
  on conflict (key) do update
  set data = excluded.data,
      revision = current_state.revision + 1,
      updated_at = now()
  where current_state.revision = p_expected_revision
  returning revision into saved_revision;

  if saved_revision is null then
    raise exception 'Business data changed in another session. Reload before saving.'
      using errcode = '40001';
  end if;
  return saved_revision;
end;
$$;

revoke all on function public.sdm_save_app_state(text, jsonb, bigint) from public, anon;
grant execute on function public.sdm_save_app_state(text, jsonb, bigint) to authenticated;

create or replace function public.sdm_save_app_state_batch(p_entries jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  entry jsonb;
  saved_revisions jsonb := '{}'::jsonb;
  saved_revision bigint;
  state_key text;
begin
  if not (select public.sdm_is_admin()) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_entries) <> 'array' or jsonb_array_length(p_entries) not between 1 and 10 then
    raise exception 'Invalid state batch' using errcode = '22023';
  end if;

  for entry in
    select value from jsonb_array_elements(p_entries) order by value->>'key'
  loop
    state_key := entry->>'key';
    saved_revision := public.sdm_save_app_state(
      state_key,
      entry->'data',
      (entry->>'expected_revision')::bigint
    );
    saved_revisions := jsonb_set(saved_revisions, array[state_key], to_jsonb(saved_revision), true);
  end loop;
  return saved_revisions;
end;
$$;

revoke all on function public.sdm_save_app_state_batch(jsonb) from public, anon;
grant execute on function public.sdm_save_app_state_batch(jsonb) to authenticated;

create or replace function public.sdm_import_legacy_state(
  p_entries jsonb,
  p_quote_requests jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  entry jsonb;
  state_key text;
  imported_keys jsonb := '{}'::jsonb;
begin
  if not (select public.sdm_is_admin()) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_entries) <> 'array' or jsonb_array_length(p_entries) > 7 then
    raise exception 'Invalid legacy state backup' using errcode = '22023';
  end if;
  if p_quote_requests is null or jsonb_typeof(p_quote_requests) <> 'array' then
    raise exception 'Invalid legacy quote backup' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(74613820);
  if exists (select 1 from public.sdm_app_state) then
    raise exception 'The business database is no longer empty. Refresh and review the current data.'
      using errcode = '40001';
  end if;

  for entry in select value from jsonb_array_elements(p_entries) order by value->>'key'
  loop
    state_key := entry->>'key';
    if state_key not in (
      'sdm_gear_inventory',
      'sdm_orders',
      'sdm_updates',
      'sdm_customer_profiles',
      'sdm_quotations',
      'sdm_partners',
      'sdm_media_config'
    ) or entry->'data' is null or pg_column_size(entry->'data') > 5000000 then
      raise exception 'Invalid legacy state entry' using errcode = '22023';
    end if;
    insert into public.sdm_app_state (key, data, revision, updated_at)
    values (state_key, entry->'data', 1, now());
    imported_keys := jsonb_set(imported_keys, array[state_key], '1'::jsonb, true);
  end loop;

  perform public.sdm_sync_quote_requests(p_quote_requests);
  return imported_keys;
end;
$$;

revoke all on function public.sdm_import_legacy_state(jsonb, jsonb) from public, anon;
grant execute on function public.sdm_import_legacy_state(jsonb, jsonb) to authenticated;

create or replace function public.sdm_submit_quote_request(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_id text;
  phone text;
  cleaned_payload jsonb;
begin
  if p_payload is null or pg_column_size(p_payload) > 100000 then
    raise exception 'Invalid request payload' using errcode = '22023';
  end if;

  phone := regexp_replace(coalesce(p_payload->>'customerPhone', ''), '[^0-9]', '', 'g');
  if length(trim(coalesce(p_payload->>'customerName', ''))) not between 2 and 120
    or length(phone) not between 8 and 15
    or length(trim(coalesce(p_payload->>'customerEmail', ''))) > 254
    or coalesce(p_payload->>'customerEmail', '') !~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    or length(coalesce(p_payload->>'message', '')) > 3000
    or length(trim(coalesce(p_payload->>'eventType', ''))) not between 1 and 120
    or coalesce(p_payload->>'requestedDate', '') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
  then
    raise exception 'Please check the contact and event details' using errcode = '22023';
  end if;
  if nullif(p_payload->>'requestedEndDate', '') is not null
    and (p_payload->>'requestedEndDate') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
  then
    raise exception 'Invalid return date' using errcode = '22023';
  end if;
  if jsonb_typeof(p_payload->'rentalItems') = 'array'
    and jsonb_array_length(p_payload->'rentalItems') > 50
  then
    raise exception 'Too many items in request' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(74613820);
  perform pg_advisory_xact_lock(74613819);
  if (select count(*) from public.sdm_quote_requests where created_at > now() - interval '1 hour') >= 50 then
    raise exception 'The enquiry service is temporarily busy. Please call us directly.'
      using errcode = 'P0001';
  end if;
  if exists (
    select 1 from public.sdm_quote_requests
    where customer_phone = phone and created_at > now() - interval '10 minutes'
  ) then
    raise exception 'A recent request was already received for this phone number'
      using errcode = 'P0001';
  end if;

  request_id := coalesce(nullif(p_payload->>'id', ''), gen_random_uuid()::text);
  cleaned_payload := p_payload || jsonb_build_object(
    'id', request_id,
    'customerPhone', phone,
    'status', 'pending',
    'createdAt', now()
  );
  insert into public.sdm_quote_requests (id, payload, customer_phone)
  values (request_id, cleaned_payload, phone);
  return cleaned_payload;
end;
$$;

revoke all on function public.sdm_submit_quote_request(jsonb) from public;
grant execute on function public.sdm_submit_quote_request(jsonb) to anon, authenticated;

create or replace function public.sdm_sync_quote_requests(p_requests jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not (select public.sdm_is_admin()) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;
  if jsonb_typeof(p_requests) <> 'array' or jsonb_array_length(p_requests) > 10000 then
    raise exception 'Invalid quote request collection' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(74613820);
  insert into public.sdm_quote_requests (id, payload, customer_phone, created_at)
  select
    request->>'id',
    request,
    regexp_replace(coalesce(request->>'customerPhone', ''), '\s', '', 'g'),
    coalesce(nullif(request->>'createdAt', '')::timestamptz, now())
  from jsonb_array_elements(p_requests) request
  where coalesce(request->>'id', '') <> ''
    and coalesce(request->>'customerPhone', '') <> ''
  on conflict (id) do update
  set payload = excluded.payload,
      customer_phone = excluded.customer_phone;
end;
$$;

revoke all on function public.sdm_sync_quote_requests(jsonb) from public, anon;
grant execute on function public.sdm_sync_quote_requests(jsonb) to authenticated;
