import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/db';

/**
 * Public (anon) Supabase client for unauthenticated reads.
 * No cookies are used; safe for public pages and static fetches.
 * Explicitly disables auth persistence to prevent browser console errors/attempts.
 */
export function createPublicSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.');
  }
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
