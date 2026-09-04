import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

// Never crash at import time when env vars are missing (mock/demo mode).
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export function getSession() {
  return supabase?.auth.getSession() ?? Promise.resolve({ data: { session: null } });
}

export function onAuthChange(callback) {
  const { data } = supabase?.auth.onAuthStateChange((event, session) => callback(event, session)) ?? {
    data: { subscription: { unsubscribe: () => {} } },
  };
  return () => data.subscription.unsubscribe();
}

export async function signIn(email, password) {
  if (!supabase) throw new Error('Supabase is not configured');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase?.auth.signOut();
}