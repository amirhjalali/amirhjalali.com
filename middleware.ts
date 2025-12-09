import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const hostname = request.headers.get('host') || ''

    // Handle notes subdomain routing
    if (hostname.startsWith('notes.') || hostname === 'notes.localhost:3000' || hostname === 'notes.localhost') {
        const url = request.nextUrl.clone()

        // If already on /notes path, continue
        if (url.pathname.startsWith('/notes')) {
            // Check for session cookie on notes routes (except login)
            if (url.pathname !== '/notes/login') {
                const session = request.cookies.get('admin_session')
                if (!session) {
                    url.pathname = '/notes/login'
                    return NextResponse.redirect(url)
                }
            }
            return NextResponse.next()
        }

        // Rewrite subdomain to /notes/* path
        url.pathname = `/notes${url.pathname}`
        return NextResponse.rewrite(url)
    }

    // Check if it's an admin route
    if (request.nextUrl.pathname.startsWith('/admin')) {
        // Allow login page
        if (request.nextUrl.pathname === '/admin/login') {
            return NextResponse.next()
        }

        // Check for session cookie
        const session = request.cookies.get('admin_session')
        if (!session) {
            return NextResponse.redirect(new URL('/admin/login', request.url))
        }
    }

    // Check if it's a notes route (when accessed directly, not via subdomain)
    if (request.nextUrl.pathname.startsWith('/notes')) {
        // Allow login page
        if (request.nextUrl.pathname === '/notes/login') {
            return NextResponse.next()
        }

        // Check for session cookie
        const session = request.cookies.get('admin_session')
        if (!session) {
            return NextResponse.redirect(new URL('/notes/login', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
