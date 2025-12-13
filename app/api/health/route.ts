import { NextResponse } from 'next/server';
import { getUser } from '../../../lib/supabase/server';
import { getCurrentProfile } from '../../../lib/authz';

// Simple healthcheck: confirms API can reach Supabase auth context.
export async function GET() {
  try {
    const user = await getUser();
    const profile = user ? await getCurrentProfile() : null;
    return NextResponse.json({
      ok: true,
      auth: user ? 'logged-in' : 'logged-out',
      user_id: user?.id ?? null,
      role: profile?.role ?? null,
    });
  } catch (error) {
    console.error('Supabase health check failed', error);
    return NextResponse.json({ ok: false, error: 'supabase_unreachable' }, { status: 500 });
  }
}
