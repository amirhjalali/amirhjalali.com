'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

// Cookie configuration
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90 // 90 days

/**
 * Hash a password using SHA-256 (async for Web Crypto API compatibility)
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify password against stored hash or plain text fallback
 * Reads env vars at runtime, not build time
 */
async function verifyPassword(password: string): Promise<boolean> {
  // Read env vars at runtime
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || ''
  const plainPassword = process.env.ADMIN_PASSWORD || ''
  
  // If hash is configured, use hash comparison
  if (passwordHash) {
    const inputHash = await hashPassword(password)
    return inputHash === passwordHash
  }
  // Fallback to plain text comparison (development only)
  if (plainPassword) {
    return password === plainPassword
  }
  return false
}

export interface LoginState {
  error?: string
  success?: boolean
}

export interface Session {
  authenticated: boolean
  loginTime: number
}

/**
 * Unified login action - password only authentication
 */
export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const password = formData.get('password') as string
  const redirectTo = formData.get('redirectTo') as string || '/notes'

  if (!password) {
    return { error: 'Password is required' }
  }

  if (await verifyPassword(password)) {
    const cookieStore = await cookies()
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined
    
    cookieStore.set('admin_session', JSON.stringify({ 
      authenticated: true, 
      loginTime: Date.now() 
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      ...(cookieDomain && { domain: cookieDomain }),
    })
    redirect(redirectTo)
  }

  return { error: 'Invalid password' }
}

/**
 * Logout and clear session
 */
export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('admin_session')
  redirect('/login')
}

/**
 * Get current session
 */
export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session) return null
  try {
    return JSON.parse(session.value)
  } catch {
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return !!session?.authenticated
}
