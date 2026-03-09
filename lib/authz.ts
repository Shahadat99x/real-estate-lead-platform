import { redirect } from 'next/navigation';
import type { ProfilesRow, Role } from '../types/db';
import { createServerSupabaseClient } from './supabase/server';

/**
 * Error thrown when user is authenticated but has no profile row.
 * This indicates a data integrity issue - user exists in auth but not in profiles table.
 */
export class ProfileMissingError extends Error {
  constructor(userId: string) {
    super(`User ${userId} authenticated but has no profile row. Database trigger may have failed.`);
    this.name = 'ProfileMissingError';
  }
}

/**
 * Error thrown when user has valid profile but wrong role for the requested resource.
 */
export class ForbiddenError extends Error {
  constructor(userRole: string, requiredRoles: Role[]) {
    super(`User has role '${userRole}' but requires one of: ${requiredRoles.join(', ')}`);
    this.name = 'ForbiddenError';
  }
}

/**
 * Result type for getCurrentProfile that distinguishes different auth states.
 */
export type AuthState =
  | { ok: true; profile: ProfilesRow }
  | { ok: false; reason: 'no_session' }
  | { ok: false; reason: 'profile_missing'; userId: string }
  | { ok: false; reason: 'error'; error: unknown };

/**
 * Fetch the current user's profile row with detailed state info.
 * Provides better diagnostics than returning null.
 */
export async function getAuthState(): Promise<AuthState> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Case 1: No session or session error
  if (userError || !user) {
    if (userError) {
      // Log auth errors in production for debugging
      if (process.env.NODE_ENV === 'production') {
        console.warn('[Auth] Session error:', userError.message);
      }
      if (
        userError.message === 'Auth session missing!' ||
        userError.code === 'refresh_token_not_found' ||
        userError.message.includes('Refresh Token Not Found')
      ) {
        return { ok: false, reason: 'no_session' };
      }
      return { ok: false, reason: 'error', error: userError };
    }
    return { ok: false, reason: 'no_session' };
  }

  // Case 2: User exists but no profile row
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Auth] Profile fetch error:', profileError.message);
    }
    return { ok: false, reason: 'error', error: profileError };
  }

  if (!profile) {
    // Log missing profile in production for debugging
    if (process.env.NODE_ENV === 'production') {
      console.error(`[Auth] User ${user.id} authenticated but no profile row. This usually means the Supabase trigger 'handle_new_user' didn't fire or failed.`);
    }
    return { ok: false, reason: 'profile_missing', userId: user.id };
  }

  return { ok: true, profile };
}

/**
 * Fetch the current user's profile row (or null if logged out).
 * Uses a single Supabase client to read auth + profile within the same RLS context.
 * @deprecated Use getAuthState() for better diagnostics
 */
export async function getCurrentProfile(): Promise<ProfilesRow | null> {
  const authState = await getAuthState();
  if (authState.ok) {
    return authState.profile;
  }
  return null;
}

/**
 * Require an authenticated user, otherwise redirect to login.
 */
export async function requireUser(options: { redirectTo?: string } = { redirectTo: '/login' }) {
  const authState = await getAuthState();

  // Use type guard to narrow the union type
  const isOk = (state: AuthState): state is { ok: true; profile: ProfilesRow } => state.ok === true;

  if (isOk(authState)) {
    return authState.profile;
  }

  // Handle different failure reasons
  if (authState.reason === 'no_session') {
    if (options.redirectTo) redirect(options.redirectTo);
    throw new Error('Not authenticated');
  }
  // For profile_missing or error, redirect to login
  if (options.redirectTo) redirect(options.redirectTo);
  throw new Error('Authentication error');
}

/**
 * Guard helper for server code (Route Handlers / Server Actions).
 * Redirects or throws when the caller is not in one of the allowed roles.
 */
export async function requireRole(
  roles: Role[],
  options: { redirectTo?: string } = { redirectTo: '/login' }
): Promise<ProfilesRow> {
  const authState = await getAuthState();

  // Use type guard to narrow the union type
  const isOk = (state: AuthState): state is { ok: true; profile: ProfilesRow } => state.ok === true;

  if (!isOk(authState)) {
    if (authState.reason === 'no_session') {
      if (options.redirectTo) redirect(options.redirectTo);
      throw new Error('Not authenticated');
    }
    // profile_missing or error - redirect to login
    if (options.redirectTo) redirect(options.redirectTo);
    throw new Error('Authentication error');
  }

  const profile = authState.profile;

  // Check role - log warning in production if role mismatch
  if (!roles.includes(profile.role)) {
    if (process.env.NODE_ENV === 'production') {
      console.warn(`[Auth] Access denied: User ${profile.id} has role '${profile.role}' but requires one of: ${roles.join(', ')}`);
    }
    if (options.redirectTo) redirect(options.redirectTo);
    throw new ForbiddenError(profile.role, roles);
  }

  return profile;
}

/**
 * Check if the current user has admin role.
 * Returns profile if admin, null otherwise (no redirect).
 */
export async function checkIsAdmin(): Promise<ProfilesRow | null> {
  const authState = await getAuthState();
  const isOk = (state: AuthState): state is { ok: true; profile: ProfilesRow } => state.ok === true;
  
  if (!isOk(authState)) {
    return null;
  }
  
  if (authState.profile.role !== 'ADMIN') {
    if (process.env.NODE_ENV === 'production') {
      console.warn(`[Auth] User ${authState.profile.id} with role '${authState.profile.role}' attempted admin-only action`);
    }
    return null;
  }
  
  return authState.profile;
}
