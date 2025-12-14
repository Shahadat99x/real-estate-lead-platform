import { redirect } from 'next/navigation';
import type { ProfilesRow, Role } from '../types/db';
import { createServerSupabaseClient } from './supabase/server';

/**
 * Fetch the current user's profile row (or null if logged out).
 * Uses a single Supabase client to read auth + profile within the same RLS context.
 */
export async function getCurrentProfile(): Promise<ProfilesRow | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // getUser returns an error when no session is present; treat that as logged-out.
  if (userError) {
    if (userError.message === 'Auth session missing!' ||
      userError.code === 'refresh_token_not_found' ||
      userError.message.includes('Refresh Token Not Found')) {
      return null;
    }
    throw userError;
  }
  if (!user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) throw profileError;
  return profile ?? null;
}

/**
 * Require an authenticated user, otherwise redirect to login.
 */
export async function requireUser(options: { redirectTo?: string } = { redirectTo: '/login' }) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    if (error.message === 'Auth session missing!' ||
      error.code === 'refresh_token_not_found' ||
      error.message.includes('Refresh Token Not Found')) {
      // Allow flow to continue to 'if (!user)' check below
    } else {
      throw error;
    }
  }
  if (!user) {
    if (options.redirectTo) redirect(options.redirectTo);
    throw new Error('Not authenticated');
  }
  return user;
}

/**
 * Guard helper for server code (Route Handlers / Server Actions).
 * Redirects or throws when the caller is not in one of the allowed roles.
 */
export async function requireRole(
  roles: Role[],
  options: { redirectTo?: string } = { redirectTo: '/login' }
): Promise<ProfilesRow> {
  const profile = await getCurrentProfile();

  if (!profile) {
    if (options.redirectTo) redirect(options.redirectTo);
    throw new Error('Not authenticated');
  }

  if (!roles.includes(profile.role)) {
    if (options.redirectTo) redirect(options.redirectTo);
    throw new Error('Forbidden');
  }

  return profile;
}
