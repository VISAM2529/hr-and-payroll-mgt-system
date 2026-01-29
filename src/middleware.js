// src/middleware.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

// Public routes
const publicRoutes = ['/auth/login', '/auth/register'];

// Role-based protected routes
const protectedRoutes = [
  { path: '/dashboard', roles: ['admin', 'employee'] },
  { path: '/dashboard/payroll', roles: ['admin'] },
  { path: '/dashboard/tasks', roles: ['employee'] },
];

export function middleware(req) {
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

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/login';
    url.searchParams.set('message', 'Please login first');
    return NextResponse.redirect(url);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Role-based access check
    if (!routeConfig.roles.includes(decoded.role)) {
      const url = req.nextUrl.clone();
      url.pathname = '/unauthorized';
      url.searchParams.set('message', 'You do not have access to this page');
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch {
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
