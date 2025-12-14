import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/db';

/**
 * Server-side Supabase client for Next.js App Router.
 * Reads/writes auth cookies via next/headers so SSR + Server Actions stay in sync.
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
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // swallow to avoid Next.js "cookies can only be modified" errors in server components
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.delete({ name, ...options });
        } catch {
          // swallow to avoid Next.js "cookies can only be modified" errors in server components
        }
      },
    },
  });
}

/**
 * Convenience to fetch the current auth session (or null when logged out).
 */
export async function getSession() {
  const supabase = await createServerSupabaseClient();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      // Check specifically for refresh token errors which cause 500s
      if (error.code === 'refresh_token_not_found' || error.message.includes('Refresh Token Not Found')) {
        return null;
      }
      throw error;
    }
    return data.session ?? null;
  } catch (err) {
    // Safety net for other auth errors during rendering
    return null;
  }
}

/**
 * Convenience to fetch the current user (or null when logged out).
 */
export async function getUser() {
  const supabase = await createServerSupabaseClient();
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    // When logged out, Supabase returns an auth error; treat that as "no user" instead of throwing.
    if (error) {
      // Specifically handle refresh token missing/invalid as logged out state
      if (error.code === 'refresh_token_not_found' ||
        error.message.includes('Refresh Token Not Found') ||
        error.message === 'Auth session missing!') {
        return null;
      }
      throw error;
    }
    return user ?? null;
  } catch (err) {
    // Safety net: if getUser fails during render (e.g. cookie issue), treat as anon
    return null;
  }
}
