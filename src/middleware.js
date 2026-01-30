// src/middleware.js
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

// Public routes
const publicRoutes = ['/auth/login', '/auth/register'];

// Role-based protected routes
// Role-based protected routes
// ORDER MATTERS: Specific routes must come before generic routes
const protectedRoutes = [
  { path: '/dashboard/payroll', roles: ['admin', 'super_admin'] },
  { path: '/dashboard/crm', roles: ['admin', 'super_admin'] },
  { path: '/communication', roles: ['admin', 'super_admin'] },
  { path: '/finance', roles: ['admin', 'super_admin'] },
  { path: '/recruitment', roles: ['admin', 'super_admin'] },
  { path: '/dashboard/tasks', roles: ['employee'] },
  { path: '/dashboard', roles: ['admin', 'employee', 'supervisor', 'hr', 'super_admin'] },
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Find protected route config
  const routeConfig = protectedRoutes.find(route =>
    pathname.startsWith(route.path)
  );

  if (!routeConfig) return NextResponse.next(); // Route not protected

  // Check for token in cookies
  const token = req.cookies.get('authToken')?.value;

  // console.log(`[Middleware] Path: ${pathname}, RouteConfig found: ${!!routeConfig}, Token present: ${!!token}`);

  if (!token) {
    // console.log('[Middleware] No token found, redirecting to login');
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('message', 'Please login first');
    return NextResponse.redirect(url);
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    const userRole = payload.role;

    // console.log(`[Middleware] Decoded role: ${userRole}, Allowed: ${routeConfig.roles}`);

    // Role-based access check
    if (!routeConfig.roles.includes(userRole)) {
      console.log(`[Middleware] Access denied. User Role: ${userRole} not in ${routeConfig.roles}`);
      const url = req.nextUrl.clone();
      url.pathname = '/unauthorized';
      url.searchParams.set('message', 'You do not have access to this page');
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (err) {
    console.error(`[Middleware] Token verification failed: ${err.message}`);
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('message', 'Session expired. Please login again.');
    return NextResponse.redirect(url);
  }
}

// Apply middleware to all routes except static & API
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
