import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const role = req.auth?.user?.role

  if (!isLoggedIn && pathname !== '/login') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isLoggedIn && pathname === '/login') {
    if (role === 'CASHIER') {
      return NextResponse.redirect(new URL('/pos', req.url))
    }
    return NextResponse.redirect(new URL('/', req.url))
  }

  // Cajero solo puede acceder a /pos
  if (isLoggedIn && role === 'CASHIER' && pathname !== '/pos') {
    return NextResponse.redirect(new URL('/pos', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
