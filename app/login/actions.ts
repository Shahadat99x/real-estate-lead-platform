"use server";

import { redirect } from 'next/navigation';
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

  // Session cookies set by Supabase SSR client. Redirect server-side for consistency.
  redirect('/dashboard');
}
