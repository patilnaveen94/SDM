import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://dqzfmsnkpsjtmhjxgyvr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GMh13bKjcWWVNs3yZ-hLlw_UW7zLbOg';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  })
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to the web environment.');
  }
  return supabase;
}
