import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getAuthStorage } from './auth-storage';
import { env, hasSupabaseEnv } from './env';
import type { Database } from '@/types/database';

let client: SupabaseClient<Database> | null = null;

/**
 * Returns Supabase client on native/web clients only.
 * Returns null during Node SSR (expo-router web prerender) to avoid AsyncStorage/window errors.
 */
export function getSupabase(): SupabaseClient<Database> | null {
  if (!hasSupabaseEnv() || typeof window === 'undefined') {
    return null;
  }
  if (!client) {
    client = createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: getAuthStorage(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return client;
}
