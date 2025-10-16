/**
 * Client-side authentication for static sites
 * Note: This is less secure than server-side auth but necessary for GitHub Pages
 */

// These will be set at build time from environment variables
const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'changeme'

export interface AuthUser {
  username: string
  role: string
}

/**
 * Verify admin credentials (client-side)
 */
export function verifyCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

/**
 * Create a session for authenticated user
 */
export function createSession(username: string): AuthUser {
  const user = {
    username,
    role: 'admin',
  }

  // Store session in localStorage with timestamp
  const session = {
    user,
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_session', JSON.stringify(session))
  }

  return user
}

/**
 * Get current session
 */
export function getSession(): AuthUser | null {
  if (typeof window === 'undefined') return null

  try {
    const sessionStr = localStorage.getItem('admin_session')
    if (!sessionStr) return null

    const session = JSON.parse(sessionStr)

    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      localStorage.removeItem('admin_session')
      return null
    }

    return session.user
  } catch (error) {
    console.error('Error reading session:', error)
    return null
  }
}

/**
 * Clear current session
 */
export function clearSession(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_session')
  }
}
