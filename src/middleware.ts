import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';


const ACCESS_TOKEN_COOKIE = 'accessToken';


const PROTECTED_PATHS = [
  '/dashboard',
  '/research',
  '/history',
  '/profile',
  '/settings',
];


const AUTH_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  const isProtectedPath = PROTECTED_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  const isAuthPath = AUTH_PATHS.some((path) =>
    pathname.startsWith(path)
  );

  // ── Unauthenticated → redirect to /login with callbackUrl ─────────────────
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
    // Preserve full path + search so deep links round-trip correctly
    const callback = pathname + request.nextUrl.search;
    loginUrl.searchParams.set('callbackUrl', callback);
    return NextResponse.redirect(loginUrl);
  }

  // ── Already authenticated → bounce off auth pages ─────────────────────────
  if (isAuthPath && token) {
    // Respect any callbackUrl they were trying to reach before being bounced
    const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');
    const destination =
      callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/research';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {

  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};