insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('sdm-public-media', 'sdm-public-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('sdm-testimonial-photos', 'sdm-testimonial-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.sdm_get_public_state()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'sdm_gear_inventory',
      coalesce((
        select jsonb_agg(gear_items.item - 'serialNumber')
        from public.sdm_app_state state
        cross join lateral jsonb_array_elements(state.data) as gear_items(item)
        where state.key = 'sdm_gear_inventory'
      ), '[]'::jsonb),
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

drop policy if exists "Public can view SDM media" on storage.objects;
drop policy if exists "Admins can upload SDM media" on storage.objects;
drop policy if exists "Admins can update SDM media" on storage.objects;
drop policy if exists "Admins can delete SDM media" on storage.objects;
drop policy if exists "Public can upload testimonial photos" on storage.objects;
drop policy if exists "Public can view approved testimonial photos" on storage.objects;
drop policy if exists "Admins can view testimonial photos" on storage.objects;
drop policy if exists "Admins can delete testimonial photos" on storage.objects;

create policy "Public can view SDM media"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'sdm-public-media');

create policy "Admins can upload SDM media"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'sdm-public-media' and (select public.sdm_is_admin()));

create policy "Admins can update SDM media"
  on storage.objects for update to authenticated
  using (bucket_id = 'sdm-public-media' and (select public.sdm_is_admin()))
  with check (bucket_id = 'sdm-public-media' and (select public.sdm_is_admin()));

create policy "Admins can delete SDM media"
  on storage.objects for delete to authenticated
  using (bucket_id = 'sdm-public-media' and (select public.sdm_is_admin()));

create policy "Public can upload testimonial photos"
  on storage.objects for insert to anon, authenticated
  with check (
    bucket_id = 'sdm-testimonial-photos'
    and (storage.foldername(name))[1] = 'submissions'
    and array_length(storage.foldername(name), 1) = 1
    and name ~* '^submissions/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$'
    and lower(coalesce(metadata->>'mimetype', '')) in ('image/jpeg', 'image/png', 'image/webp')
  );

create table if not exists public.sdm_testimonials (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  testimony text not null,
  photo_path text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now(),
  constraint sdm_testimonials_name_length check (char_length(customer_name) between 2 and 100),
  constraint sdm_testimonials_phone_length check (char_length(customer_phone) between 10 and 15),
  constraint sdm_testimonials_text_length check (char_length(testimony) between 10 and 2000),
  constraint sdm_testimonials_photo_path check (photo_path ~* '^submissions/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$')
);

create index if not exists sdm_testimonials_approved_created_idx
  on public.sdm_testimonials (created_at desc) where approved;
create index if not exists sdm_testimonials_phone_created_idx
  on public.sdm_testimonials (customer_phone, created_at desc);

create or replace function public.sdm_is_approved_testimonial_photo(p_path text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.sdm_testimonials
    where photo_path = p_path and approved
  );
$$;

revoke all on function public.sdm_is_approved_testimonial_photo(text) from public;
grant execute on function public.sdm_is_approved_testimonial_photo(text) to anon, authenticated;

create policy "Public can view approved testimonial photos"
  on storage.objects for select to anon, authenticated
  using (
    bucket_id = 'sdm-testimonial-photos'
    and (select public.sdm_is_approved_testimonial_photo(name))
  );

create policy "Admins can view testimonial photos"
  on storage.objects for select to authenticated
  using (bucket_id = 'sdm-testimonial-photos' and (select public.sdm_is_admin()));

create policy "Admins can delete testimonial photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'sdm-testimonial-photos' and (select public.sdm_is_admin()));

alter table public.sdm_testimonials enable row level security;
revoke all on public.sdm_testimonials from anon, authenticated;
grant select, update, delete on public.sdm_testimonials to authenticated;
grant select (id, customer_name, testimony, photo_path, approved, created_at) on public.sdm_testimonials to anon;

drop policy if exists "Admins can read testimonials" on public.sdm_testimonials;
drop policy if exists "Admins can update testimonials" on public.sdm_testimonials;
drop policy if exists "Admins can delete testimonials" on public.sdm_testimonials;
drop policy if exists "Public can read approved testimonials" on public.sdm_testimonials;

create policy "Public can read approved testimonials"
  on public.sdm_testimonials for select to anon
  using (approved);
create policy "Admins can read testimonials"
  on public.sdm_testimonials for select to authenticated
  using ((select public.sdm_is_admin()));
create policy "Admins can update testimonials"
  on public.sdm_testimonials for update to authenticated
  using ((select public.sdm_is_admin()))
  with check ((select public.sdm_is_admin()));
create policy "Admins can delete testimonials"
  on public.sdm_testimonials for delete to authenticated
  using ((select public.sdm_is_admin()));

create or replace view public.sdm_public_testimonials with (security_invoker = true) as
select id, customer_name, testimony, photo_path, created_at
from public.sdm_testimonials
where approved;

revoke all on public.sdm_public_testimonials from public;
grant select on public.sdm_public_testimonials to anon, authenticated;

create or replace function public.sdm_submit_testimonial(
  p_customer_name text,
  p_customer_phone text,
  p_testimony text,
  p_photo_path text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  cleaned_phone text;
  testimonial_id uuid;
begin
  cleaned_phone := regexp_replace(coalesce(p_customer_phone, ''), '[^0-9]', '', 'g');

  if char_length(trim(coalesce(p_customer_name, ''))) not between 2 and 100
    or char_length(cleaned_phone) not between 10 and 15
    or char_length(trim(coalesce(p_testimony, ''))) not between 10 and 2000
    or coalesce(p_photo_path, '') !~* '^submissions/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$'
  then
    raise exception 'Please provide your name, a valid phone number, a photo, and a testimony.' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from storage.objects
    where bucket_id = 'sdm-testimonial-photos'
      and name = p_photo_path
      and created_at > now() - interval '30 minutes'
  ) then
    raise exception 'Upload your photo before submitting your testimony.' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(74613818);
  if (select count(*) from public.sdm_testimonials where created_at > now() - interval '1 hour') >= 100
    or exists (
      select 1 from public.sdm_testimonials
      where customer_phone = cleaned_phone and created_at > now() - interval '10 minutes'
    )
  then
    raise exception 'A recent testimony was already received for this phone number. Please try again later.' using errcode = 'P0001';
  end if;

  insert into public.sdm_testimonials (customer_name, customer_phone, testimony, photo_path)
  values (trim(p_customer_name), cleaned_phone, trim(p_testimony), p_photo_path)
  returning id into testimonial_id;

  return testimonial_id;
end;
$$;

revoke all on function public.sdm_submit_testimonial(text, text, text, text) from public;
grant execute on function public.sdm_submit_testimonial(text, text, text, text) to anon, authenticated;
