/**
 * Next.js Middleware
 * Authentication and authorization checks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/api/bookings', '/api/customers', '/api/quotes', '/api/payments'];

// Routes that are public (no auth required)
const publicRoutes = ['/login', '/signup', '/api/auth/login', '/api/auth/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // If it's a protected route, check for auth token
  if (isProtectedRoute) {
    const user = getUserFromRequest(request);

    if (!user) {
      // Redirect to login for UI routes
      if (!pathname.startsWith('/api/')) {
        const url = new URL('/login', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }

      // Return 401 for API routes
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Attach user to request headers (for API routes to use)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.userId);
    requestHeaders.set('x-user-email', user.email);
    requestHeaders.set('x-user-tier', user.subscriptionTier);
    requestHeaders.set('x-user-status', user.subscriptionStatus);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // If logged in and trying to access public auth routes, redirect to dashboard
  if (isPublicRoute && !pathname.startsWith('/api/')) {
    const user = getUserFromRequest(request);

    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
