import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

/**
 * Get session from cookies - works in both server components and API routes
 * @param request - Optional NextRequest for API routes (not used, kept for compatibility)
 */
export async function getSession(_request?: NextRequest) {
  // The request parameter is kept for API compatibility but not used
  // We read directly from cookies() which works in both contexts
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  if (!session) return null
  try {
    return JSON.parse(session.value)
  } catch {
    return null
  }
}
