import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Log request information for debugging
  console.log(`[Middleware] Request path: ${request.nextUrl.pathname}`);
  console.log(`[Middleware] Request query params:`, Object.fromEntries(request.nextUrl.searchParams.entries()));
  
  // Allow the request to continue
  return NextResponse.next();
}

// Configure which routes to run the middleware on
export const config = {
  matcher: [
    // Match all auth routes
    '/auth/:path*',
    // Match all auth API routes
    '/api/auth/:path*',
  ],
};
