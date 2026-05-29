import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Routes that don't require authentication
const publicRoutes = [
  '/api/auth',
  '/login',
  '/signup',
  '/_next/static',
  '/_next/image',
  '/favicon.ico',
  '/',
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth?.user;

  // Allow public routes to pass through
  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));
  if (isPublic) {
    return NextResponse.next();
  }

  // Protect all /api/* routes (except auth routes already handled above)
  if (pathname.startsWith('/api/') && !isLoggedIn) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Protect app routes - redirect to login if not authenticated
  if (!pathname.startsWith('/api') && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Protect API routes except auth
    '/api/:path*',
    // Protect app pages
    '/colleges/:path*',
    '/compare/:path*',
    '/predictor/:path*',
    '/discuss/:path*',
    '/saved/:path*',
  ],
};