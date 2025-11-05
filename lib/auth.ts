/**
 * Client-side authentication for static sites
 * Note: This is less secure than server-side auth but necessary for GitHub Pages
 */

// These will be set at build time from environment variables
const ADMIN_USERNAME = process.env.NEXT_PUBLIC_ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD_HASH = process.env.NEXT_PUBLIC_ADMIN_PASSWORD_HASH || ''
const ADMIN_PASSWORD_FALLBACK = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || ''

// Debug logging (remove in production)
console.log('Auth Debug:', {
  username: ADMIN_USERNAME,
  hasHash: !!ADMIN_PASSWORD_HASH,
  hashLength: ADMIN_PASSWORD_HASH?.length,
  hasFallback: !!ADMIN_PASSWORD_FALLBACK,
})

export interface AuthUser {
  username: string
  role: string
}

async function sha256(input: string): Promise<string> {
  const cryptoObj = globalThis.crypto
  if (!cryptoObj?.subtle) {
    throw new Error('Web Crypto API is unavailable')
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await cryptoObj.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify admin credentials (client-side)
 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  console.log('Verify credentials called:', { username, passwordLength: password?.length })

  if (!username || !password) {
    console.log('Missing username or password')
    return false
  }

  if (username !== ADMIN_USERNAME) {
    console.log('Username mismatch:', { provided: username, expected: ADMIN_USERNAME })
    return false
  }

  if (ADMIN_PASSWORD_HASH) {
    try {
      const hashedInput = await sha256(password)
      console.log('Hash comparison:', {
        inputHash: hashedInput,
        expectedHash: ADMIN_PASSWORD_HASH,
        match: hashedInput === ADMIN_PASSWORD_HASH
      })
      return hashedInput === ADMIN_PASSWORD_HASH
    } catch (error) {
      console.error('Error hashing password for verification:', error)
      return false
    }
  }

  if (ADMIN_PASSWORD_FALLBACK) {
    console.log('Using fallback password comparison')
    const match = password === ADMIN_PASSWORD_FALLBACK
    console.log('Fallback match:', match)
    return match
  }

  console.log('No password hash or fallback configured')
  return false
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
