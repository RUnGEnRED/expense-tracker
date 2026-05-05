import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

// Routes that require authentication
const protectedRoutes = [
  '/pracownik',
  '/kierownik',
  '/api/wnioski',
]

// Auth routes - for unauthenticated users
const authRoutes = ['/login', '/register']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Get token from cookie
  const token = req.cookies.get('token')?.value
  
  // Check if current route is protected
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  
  // If route is protected and no token -> redirect to login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  // If user has token and is on auth route -> redirect to dashboard
  if (isAuthRoute && token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      // Redirect based on role
      if (payload.rola === 'KIEROWNIK') {
        return NextResponse.redirect(new URL('/kierownik', req.url))
      } else {
        return NextResponse.redirect(new URL('/pracownik', req.url))
      }
    } catch {
      // Invalid token, allow proceeding to login
    }
  }
  
  // Check role-specific permissions
  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET)
      
      // Employee cannot access manager routes
      if (pathname.startsWith('/kierownik') && payload.rola !== 'KIEROWNIK') {
        return NextResponse.redirect(new URL('/pracownik', req.url))
      }
      
      // Manager cannot access employee routes
      if (pathname.startsWith('/pracownik') && payload.rola !== 'PRACOWNIK') {
        return NextResponse.redirect(new URL('/kierownik', req.url))
      }
    } catch {
      // Invalid token, clear the cookie
      const response = NextResponse.redirect(new URL('/login', req.url))
      response.cookies.delete('token')
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/pracownik/:path*', '/kierownik/:path*', '/login', '/register', '/api/wnioski/:path*']
}
