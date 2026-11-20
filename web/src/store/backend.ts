import { getSupabaseClient, isSupabaseConfigured } from '../lib/supabase';

const PRIVATE_STATE_KEYS = [
  'sdm_gear_inventory',
  'sdm_orders',
  'sdm_updates',
  'sdm_customer_profiles',
  'sdm_quotations',
  'sdm_partners',
  'sdm_media_config',
] as const;
const QUOTE_REQUESTS_KEY = 'sdm_quote_requests';
const LEGACY_BACKUP_KEY = 'sdm_pre_supabase_state';
const LEGACY_BACKUP_AVAILABLE_KEY = 'sdm_pre_supabase_backup_available';
const PRIVATE_STATE_EMPTY_KEY = 'sdm_supabase_private_state_empty';
const ADMIN_SESSION_KEY = 'sdm_admin_auth';

const revisions = new Map<string, number>();
const stateWriteQueues = new Map<string, Promise<void>>();
let startupLegacyState: Record<string, unknown> | null = null;
let backendInitialization: Promise<void> | null = null;

function emitBackendError(error: unknown): void {
  const message = error instanceof Error ? error.message : 'Unknown backend error';
  console.error('Supabase operation failed:', error);
  window.dispatchEvent(new CustomEvent('sdm:backend-error', { detail: message }));
}

function cacheValue(key: string, value: unknown): void {
  if (value !== undefined && value !== null) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

function captureLegacyState(): Record<string, unknown> {
  const legacy: Record<string, unknown> = {};
  for (const key of [...PRIVATE_STATE_KEYS, QUOTE_REQUESTS_KEY]) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      legacy[key] = JSON.parse(raw);
    } catch (error) {
      emitBackendError(new Error(`Could not preserve local data for ${key}: ${String(error)}`));
    }
  }
  return legacy;
}

async function hydratePrivateState(legacyState: Record<string, unknown>): Promise<boolean> {
  const client = getSupabaseClient();
  const { data: stateRows, error: stateError } = await client
    .from('sdm_app_state')
    .select('key,data,revision');
  if (stateError) throw stateError;

  const { data: quoteRows, error: quotesError } = await client
    .from('sdm_quote_requests')
    .select('id,payload');
  if (quotesError) throw quotesError;

  const rows = stateRows || [];
  const requests = (quoteRows || []).map((row: { payload: unknown }) => row.payload);
  const databaseEmpty = rows.length === 0;
  if (databaseEmpty) {
    localStorage.setItem(PRIVATE_STATE_EMPTY_KEY, 'true');
    if (Object.keys(legacyState).length > 0 && !localStorage.getItem(LEGACY_BACKUP_AVAILABLE_KEY)) {
      localStorage.setItem(LEGACY_BACKUP_KEY, JSON.stringify(legacyState));
      localStorage.setItem(LEGACY_BACKUP_AVAILABLE_KEY, 'true');
    }
  } else {
    localStorage.removeItem(PRIVATE_STATE_EMPTY_KEY);
  }

  for (const row of rows) {
    revisions.set(row.key, Number(row.revision));
    cacheValue(row.key, row.data);
  }

  if (requests.length > 0 || !localStorage.getItem(LEGACY_BACKUP_AVAILABLE_KEY)) {
    cacheValue(QUOTE_REQUESTS_KEY, requests);
  }
  return databaseEmpty;
}

export function initializeBackend(): Promise<void> {
  if (!backendInitialization) backendInitialization = initializeBackendOnce();
  return backendInitialization;
}

async function initializeBackendOnce(): Promise<void> {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  if (!isSupabaseConfigured) return;

  const client = getSupabaseClient();
  const legacy = captureLegacyState();
  startupLegacyState = legacy;
  const { data: publicState, error: publicError } = await client.rpc('sdm_get_public_state');
  if (publicError) throw publicError;
  for (const [key, value] of Object.entries((publicState || {}) as Record<string, unknown>)) {
    cacheValue(key, value);
  }

  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw sessionError;
  const session = sessionData.session;
  if (!session) {
    return;
  }

  const { data: isAdmin, error: adminError } = await client.rpc('sdm_is_admin');
  if (adminError) throw adminError;
  if (!isAdmin) {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return;
  }

  sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
  await hydratePrivateState(legacy);
}

export async function signInAdmin(email: string, password: string): Promise<{ success: boolean; message?: string }> {
  if (!isSupabaseConfigured) {
    return { success: false, message: 'Admin sign-in is unavailable until Supabase environment settings are configured.' };
  }

  const client = getSupabaseClient();
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) {
    if (!signInError.status || signInError.status >= 500) throw signInError;
    return { success: false, message: 'Email or password is incorrect.' };
  }

  const { data: isAdmin, error: adminError } = await client.rpc('sdm_is_admin');
  if (adminError) {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    throw adminError;
  }
  if (!isAdmin) {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    return { success: false, message: 'This account has not been granted SDM administrator access.' };
  }

  sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
  try {
    await hydratePrivateState(startupLegacyState || captureLegacyState());
  } catch (error) {
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    const { error: signOutError } = await client.auth.signOut();
    if (signOutError) throw signOutError;
    throw error;
  }

  return { success: true };
}

export async function signOutAdmin(): Promise<void> {
  if (isSupabaseConfigured) {
    const { error } = await getSupabaseClient().auth.signOut();
    if (error) throw error;
  }
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function isAdminSessionActive(): boolean {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

export async function submitQuoteRequest<T extends object>(request: T): Promise<T> {
  const client = getSupabaseClient();
  const { data, error } = await client.rpc('sdm_submit_quote_request', { p_payload: request });
  if (error) throw error;
  return data as T;
}

export function persistBusinessCollection(key: string, data: unknown): void {
  if (!isSupabaseConfigured || !isAdminSessionActive() || localStorage.getItem('sdm_admin_data_mode') === 'demo') return;

  const client = getSupabaseClient();
  const queueKey = key === QUOTE_REQUESTS_KEY ? 'quote-requests' : 'business-state';
  const previous = stateWriteQueues.get(queueKey) || Promise.resolve();
  const save = previous.then(async () => {
    if (key === QUOTE_REQUESTS_KEY) {
      const { error } = await client.rpc('sdm_sync_quote_requests', { p_requests: data });
      if (error) throw error;
      return;
    }

    const expectedRevision = revisions.get(key) || 0;
    const { data: revision, error } = await client.rpc('sdm_save_app_state', {
      p_key: key,
      p_data: data,
      p_expected_revision: expectedRevision,
    });
    if (error) throw error;
    revisions.set(key, Number(revision));
  });
  const reportedSave = save.catch(emitBackendError);
  stateWriteQueues.set(queueKey, reportedSave);
}

export function persistBusinessCollectionsBatch(entries: Array<{ key: string; data: unknown }>): void {
  if (!isSupabaseConfigured || !isAdminSessionActive() || localStorage.getItem('sdm_admin_data_mode') === 'demo') return;
  const stateEntries = entries.filter(entry => entry.key !== QUOTE_REQUESTS_KEY);
  if (stateEntries.length === 0) return;

  const queueKey = 'business-state';
  const previous = stateWriteQueues.get(queueKey) || Promise.resolve();
  const save = previous.then(async () => {
    const client = getSupabaseClient();
    const { data: savedRevisions, error } = await client.rpc('sdm_save_app_state_batch', {
      p_entries: stateEntries.map(entry => ({
        key: entry.key,
        data: entry.data,
        expected_revision: revisions.get(entry.key) || 0,
      })),
    });
    if (error) throw error;
    for (const entry of stateEntries) {
      const revision = (savedRevisions as Record<string, number>)[entry.key];
      if (revision !== undefined) revisions.set(entry.key, Number(revision));
    }
  });
  const reportedSave = save.catch(emitBackendError);
  stateWriteQueues.set(queueKey, reportedSave);
}

export function hasLegacyStateBackup(): boolean {
  return localStorage.getItem(LEGACY_BACKUP_AVAILABLE_KEY) === 'true'
    && localStorage.getItem(PRIVATE_STATE_EMPTY_KEY) === 'true';
}

export async function importLegacyStateBackup(): Promise<void> {
  if (!isAdminSessionActive() || !hasLegacyStateBackup()) {
    throw new Error('There is no eligible local data backup to import.');
  }

  const raw = localStorage.getItem(LEGACY_BACKUP_KEY);
  if (!raw) throw new Error('The saved browser backup is missing.');
  const backup = JSON.parse(raw) as Record<string, unknown>;
  const entries = PRIVATE_STATE_KEYS.map(key => ({
    key,
    data: backup[key] ?? (key === 'sdm_media_config' ? {} : []),
  }));
  const quoteRequests = backup[QUOTE_REQUESTS_KEY] || [];
  const client = getSupabaseClient();
  const { data: importedRevisions, error: importError } = await client.rpc('sdm_import_legacy_state', {
    p_entries: entries,
    p_quote_requests: quoteRequests,
  });
  if (importError) throw importError;

  const imported = importedRevisions as Record<string, number>;
  for (const entry of entries) {
    revisions.set(entry.key, Number(imported[entry.key]));
    cacheValue(entry.key, entry.data);
  }

  const { data: quoteRows, error: quotesError } = await client
    .from('sdm_quote_requests')
    .select('id,payload');
  if (quotesError) throw quotesError;
  cacheValue(QUOTE_REQUESTS_KEY, (quoteRows || []).map((row: { payload: unknown }) => row.payload));
  localStorage.removeItem(LEGACY_BACKUP_AVAILABLE_KEY);
  localStorage.removeItem(PRIVATE_STATE_EMPTY_KEY);
  localStorage.removeItem(LEGACY_BACKUP_KEY);
}
