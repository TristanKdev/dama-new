import { NextResponse, type NextRequest } from 'next/server';
import { createMiddlewareClient } from '@/lib/supabase';

/**
 * CSRF protection: validate that mutating requests originate from our own site.
 * Checks Origin header (sent by all modern browsers for fetch/form POST).
 * Returns an error response if invalid, or null if valid.
 */
function checkCsrf(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const host = request.headers.get('host');

  if (!host) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Origin header is sent by all modern browsers for POST/PUT/PATCH/DELETE
  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return null; // Valid
    } catch {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Fallback: check Referer header
  const referer = request.headers.get('referer');
  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost !== host) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return null; // Valid
    } catch {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // Neither Origin nor Referer — reject (all browsers send at least one)
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });
  const pathname = request.nextUrl.pathname;

  // ── CSRF protection for all mutating API requests (except webhooks) ──
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/webhooks/')) {
    const method = request.method;
    if (method !== 'GET' && method !== 'HEAD' && method !== 'OPTIONS') {
      const csrfError = checkCsrf(request);
      if (csrfError) return csrfError;
    }
  }

  // ── Auth protection for /account, /admin, /api/admin routes ──
  const needsAuth = pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/account');

  if (!needsAuth) return response;

  let user = null;
  try {
    const supabase = createMiddlewareClient(request, response);
    const { data } = await supabase.auth.getUser();
    user = data.user;

    // Protect /account pages — require authentication (any role)
    if (pathname.startsWith('/account') && !user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Protect /admin pages and /api/admin routes — require auth + admin role
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
    if (isAdminRoute) {
      if (!user) {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || profile.role !== 'admin') {
        if (pathname.startsWith('/api/')) {
          return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  } catch {
    // On auth failure, deny access to protected routes
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*', '/api/:path*'],
};
