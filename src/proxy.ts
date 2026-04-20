// src/middleware.ts

import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_ROUTES = [
  '/dashboard', 
  '/parent-dashboard', 
  '/teacher-dashboard', 
  '/receptionist-dashboard', 
  '/principal-dashboard',
  '/admin-dashboard' // 🛡️ Added Admin Dashboard
]
const AUTH_ROUTES = ['/login']

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token        = req.cookies.get('token')?.value

  const isProtected = PROTECTED_ROUTES.some(r => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))

  // If trying to access a protected route without a token, send to login
  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // If logged in and trying to access the login page, redirect to the routing hub
  if (isAuthRoute && token) {
    // We don't know the exact role here, so redirect to the role-check page
    return NextResponse.redirect(new URL('/redirect', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*', 
    '/parent-dashboard/:path*', 
    '/teacher-dashboard/:path*', 
    '/receptionist-dashboard/:path*', 
    '/principal-dashboard/:path*', 
    '/admin-dashboard/:path*', // 🛡️ Added Admin Matcher
    '/login'
  ],
}