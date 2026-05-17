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

 
  if (isProtectedPath && !token) {
    const loginUrl = new URL('/login', request.url);
  
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

 
  if (isAuthPath && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {

  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};