import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role

  // Si no está logueado y no está en login, redirigir a login
  if (!isLoggedIn && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Si está logueado y va a login, redirigir según rol
  if (isLoggedIn && pathname === '/login') {
    if (role === 'CASHIER') {
      return NextResponse.redirect(new URL('/sales', req.url))
    }
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Cajero solo puede acceder a /sales
  if (isLoggedIn && role === 'CASHIER' && pathname !== '/sales') {
    return NextResponse.redirect(new URL('/sales', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
