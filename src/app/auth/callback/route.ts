import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerSupabaseClient } from '@/lib/supabase';
import { isSafeRedirectPath } from '@/lib/validation';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') || '/account';

  // Validate redirect path to prevent open redirect attacks
  const redirectPath = isSafeRedirectPath(next) ? next : '/account';

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerSupabaseClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(redirectPath, request.url));
    }
  }

  // If no code or exchange failed, redirect to login
  return NextResponse.redirect(new URL('/login', request.url));
}
