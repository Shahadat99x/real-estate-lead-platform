import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../lib/supabase/server';

function getRedirectTarget(request: NextRequest) {
  const next = request.nextUrl.searchParams.get('next');
  if (next && next.startsWith('/')) {
    return next;
  }
  return '/';
}

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL(getRedirectTarget(request), process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin));
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL(getRedirectTarget(request), process.env.NEXT_PUBLIC_SITE_URL || request.nextUrl.origin));
}
