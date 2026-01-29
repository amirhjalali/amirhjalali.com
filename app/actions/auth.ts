'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import crypto from 'crypto'

// Password hash from environment (SHA-256)
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || ''
// Fallback to plain text password if hash not configured (development only)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || ''

// Cookie configuration
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || undefined
const COOKIE_MAX_AGE = 60 * 60 * 24 * 90 // 90 days

/**
 * Hash a password using SHA-256
 */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

/**
 * Verify password against stored hash or plain text fallback
 */
function verifyPassword(password: string): boolean {
  // If hash is configured, use hash comparison
  if (ADMIN_PASSWORD_HASH) {
    const inputHash = hashPassword(password)
    return inputHash === ADMIN_PASSWORD_HASH
  }
  // Fallback to plain text comparison (development only)
  if (ADMIN_PASSWORD) {
    return password === ADMIN_PASSWORD
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

  if (verifyPassword(password)) {
    const cookieStore = await cookies()
    cookieStore.set('admin_session', JSON.stringify({ 
      authenticated: true, 
      loginTime: Date.now() 
    }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
      ...(COOKIE_DOMAIN && { domain: COOKIE_DOMAIN }),
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

/**
 * Generate a password hash (utility for setting up new password)
 * Usage: Run in Node REPL: hashPassword('your-password')
 */
export function generatePasswordHash(password: string): string {
  return hashPassword(password)
}
