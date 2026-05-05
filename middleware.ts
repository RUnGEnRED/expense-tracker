import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

// Trasy wymagające autoryzacji
const protectedRoutes = [
  '/dashboard',
  '/pracownik',
  '/kierownik',
  '/api/wnioski',
]

// Trasy auth - dla niezalogowanych
const authRoutes = ['/login', '/register']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Pobierz token z ciasteczka
  const token = req.cookies.get('token')?.value
  
  // Sprawdź czy trasa jest chroniona
  const isProtected = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname === route || pathname.startsWith(route + '/'))
  
  // Jeśli chroniona trasa i brak tokena -> przekieruj do logowania
  if (isProtected && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  
  // Jeśli użytkownik ma token i jest na trasie auth -> przekieruj do dashboardu
  if (isAuthRoute && token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; rola: string }
      // Przekieruj w zależności od roli
      if (decoded.rola === 'KIEROWNIK') {
        return NextResponse.redirect(new URL('/kierownik', req.url))
      } else {
        return NextResponse.redirect(new URL('/pracownik', req.url))
      }
    } catch {
      // Token nieprawidłowy, pozwól przejść do logowania
    }
  }
  
  // Sprawdź uprawnienia do tras specyficznych dla ról
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: number; email: string; rola: string }
      
      // Pracownik nie może wejść na trasy kierownika
      if (pathname.startsWith('/kierownik') && decoded.rola !== 'KIEROWNIK') {
        return NextResponse.redirect(new URL('/pracownik', req.url))
      }
      
      // Kierownik nie może wejść na trasy pracownika
      if (pathname.startsWith('/pracownik') && decoded.rola !== 'PRACOWNIK') {
        return NextResponse.redirect(new URL('/kierownik', req.url))
      }
    } catch {
      // Token nieprawidłowy, wyczyść ciasteczko
      const response = NextResponse.redirect(new URL('/login', req.url))
      response.cookies.delete('token')
      return response
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/pracownik/:path*', '/kierownik/:path*', '/login', '/register', '/api/wnioski/:path*']
}
