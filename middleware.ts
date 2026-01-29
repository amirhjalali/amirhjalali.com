import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const PROTECTED_PATHS = ['/notes', '/drafts', '/today']

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // Handle notes subdomain routing
  if (hostname.startsWith('notes.') || hostname === 'notes.localhost:3000' || hostname === 'notes.localhost') {
    const url = request.nextUrl.clone()

    // If already on /notes path, check auth
    if (url.pathname.startsWith('/notes')) {
      // Check for session cookie (except on login page)
      if (url.pathname !== '/login') {
        const session = request.cookies.get('admin_session')
        if (!session) {
          url.pathname = '/login'
          url.searchParams.set('redirectTo', request.nextUrl.pathname)
          return NextResponse.redirect(url)
        }
      }
      return NextResponse.next()
    }

    // Allow API routes to pass through without rewriting
    if (url.pathname.startsWith('/api')) {
      return NextResponse.next()
    }

    // Allow login page
    if (url.pathname === '/login') {
      return NextResponse.next()
    }

    // Rewrite subdomain to /notes/* path
    url.pathname = `/notes${url.pathname}`
    return NextResponse.rewrite(url)
  }

  // Allow the login page
  if (pathname === '/login') {
    return NextResponse.next()
  }

  // Check if it's a protected route
  const isProtectedRoute = PROTECTED_PATHS.some(path => pathname.startsWith(path))
  
  if (isProtectedRoute) {
    // Check for session cookie
    const session = request.cookies.get('admin_session')
    if (!session) {
      const url = new URL('/login', request.url)
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
  }

  // Redirect old /admin paths to /drafts
  if (pathname.startsWith('/admin')) {
    const newPath = pathname.replace('/admin', '/drafts')
    return NextResponse.redirect(new URL(newPath, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
