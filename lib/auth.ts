import { SignJWT, jwtVerify } from 'jose'

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'changeme'

/**
 * Get the JWT secret key as a Uint8Array
 */
function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(SECRET_KEY)
}

/**
 * Verify admin credentials
 */
export function verifyCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

/**
 * Create a JWT token for authenticated admin
 */
export async function createToken(username: string): Promise<string> {
  const token = await new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // Token expires in 24 hours
    .sign(getSecretKey())

  return token
}

/**
 * Verify a JWT token and return the payload
 */
export async function verifyToken(token: string): Promise<{ username: string; role: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return {
      username: payload.username as string,
      role: payload.role as string
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Extract token from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}
