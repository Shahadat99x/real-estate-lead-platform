import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/db';

/**
 * Server-side Supabase client for Next.js App Router.
 * - Reads/writes auth cookies via next/headers so SSR + Server Actions stay in sync.
 * - Use only in server contexts (Route Handlers, Server Components, Server Actions).
 */
export async function createServerSupabaseClient(): Promise<SupabaseClient<Database>> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables.');
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore?.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Supabase client writes refreshed tokens; Next.js persists them to the response.
        cookieStore?.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore?.set({ name, value: '', ...options, maxAge: 0 });
      },
    },
  });
}

/**
 * Convenience to fetch the current auth session (or null when logged out).
 */
export async function getSession() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session ?? null;
}

/**
 * Convenience to fetch the current user (or null when logged out).
 */
export async function getUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  // When logged out, Supabase returns an auth error; treat that as "no user" instead of throwing.
  if (error && error.message !== 'Auth session missing!') throw error;
  return user ?? null;
}
