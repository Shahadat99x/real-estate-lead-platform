"use server";

import { redirect } from 'next/navigation';
import { getAuthState } from '../../lib/authz';
import { syncConfiguredAdminRole } from '../../lib/superadmin';
import { createServerSupabaseClient } from '../../lib/supabase/server';

export async function signIn(_prevState: { error?: string; success?: boolean }, formData: FormData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');

  if (!email || !password) {
    return { error: 'Email and password are required.' };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    await supabase.auth.signOut();
    return { error: 'Unable to verify your account after sign-in. Please try again.' };
  }

  await syncConfiguredAdminRole(user.id, user.email ?? email);

  const authState = await getAuthState();
  const isAdmin = authState.ok && authState.profile.role === 'ADMIN';

  if (!isAdmin) {
    await supabase.auth.signOut();
    return { error: 'Only the superadmin account can access the dashboard right now.' };
  }

  // Session cookies set by Supabase SSR client. Redirect server-side for consistency.
  redirect('/dashboard');
}
