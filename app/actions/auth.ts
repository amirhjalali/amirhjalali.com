'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin' // Default fallback

// Cookie domain for cross-subdomain auth (e.g., notes.amirhjalali.com)
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined

export async function login(prevState: any, formData: FormData) {
    const username = formData.get('username') as string
    const password = formData.get('password') as string
    const redirectTo = formData.get('redirectTo') as string || '/admin'

    // Simple check for now. In production, use hash verification.
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const cookieStore = await cookies()
        cookieStore.set('admin_session', JSON.stringify({ username, role: 'admin' }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
            ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
        })
        redirect(redirectTo)
    } else {
        return { error: 'Invalid credentials' }
    }
}

export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('admin_session')
    redirect('/notes/login')
}

export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')
    if (!session) return null
    try {
        return JSON.parse(session.value)
    } catch {
        return null
    }
}
