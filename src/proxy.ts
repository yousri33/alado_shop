import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionId = process.env.ADMIN_SESSION_ID || 'alado_khaled_session_secure_v1';

  // Protect /admin routes (except /admin/login)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get('admin_session');

    if (!session || session.value !== sessionId) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect /api/admin routes (except /api/admin/login)
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/login') {
    const session = request.cookies.get('admin_session');

    if (!session || session.value !== sessionId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

// Ensure the middleware runs for all admin paths
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
