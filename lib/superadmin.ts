import type { ProfilesRow } from '../types/db';
import { createServiceRoleClient } from './supabase/service';

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getConfiguredAdminEmail() {
  const email = process.env.ADMIN_EMAIL?.trim();
  return email ? normalizeEmail(email) : null;
}

export function isConfiguredAdminEmail(email?: string | null) {
  const configuredAdminEmail = getConfiguredAdminEmail();
  if (!configuredAdminEmail || !email) return false;
  return normalizeEmail(email) === configuredAdminEmail;
}

export async function syncConfiguredAdminRole(userId: string, email?: string | null): Promise<ProfilesRow | null> {
  if (!isConfiguredAdminEmail(email)) {
    return null;
  }

  const supabase = createServiceRoleClient();
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    throw profileError;
  }

  if (!profile) {
    return null;
  }

  if (profile.role === 'ADMIN') {
    return profile;
  }

  const { data: updatedProfile, error: updateError } = await supabase
    .from('profiles')
    .update({ role: 'ADMIN' })
    .eq('id', userId)
    .select('*')
    .single();

  if (updateError) {
    throw updateError;
  }

  return updatedProfile;
}

