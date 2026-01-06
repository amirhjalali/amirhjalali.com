/**
 * Rate Limiter
 * Simple in-memory rate limiting for API routes
 */

interface RateLimitEntry {
  count: number
  firstRequest: number
  lastRequest: number
}

interface RateLimiterOptions {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
  keyPrefix?: string // Prefix for keys (useful for different endpoints)
}

const DEFAULT_OPTIONS: RateLimiterOptions = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
  keyPrefix: 'api',
}

// In-memory store (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries periodically
let cleanupInterval: NodeJS.Timeout | null = null

function startCleanup() {
  if (cleanupInterval) return

  cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      // Remove entries older than 2x the window
      if (now - entry.lastRequest > DEFAULT_OPTIONS.windowMs * 2) {
        rateLimitStore.delete(key)
      }
    }
  }, 60 * 1000) // Run every minute
}

startCleanup()

/**
 * Check if a request should be rate limited
 * Returns { allowed: boolean, remaining: number, resetAt: number }
 */
export function checkRateLimit(
  identifier: string,
  options: Partial<RateLimiterOptions> = {}
): {
  allowed: boolean
  remaining: number
  resetAt: number
  retryAfter?: number
} {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const key = `${opts.keyPrefix}:${identifier}`
  const now = Date.now()

  let entry = rateLimitStore.get(key)

  // If no entry or window has passed, create new entry
  if (!entry || now - entry.firstRequest > opts.windowMs) {
    entry = {
      count: 1,
      firstRequest: now,
      lastRequest: now,
    }
    rateLimitStore.set(key, entry)

    return {
      allowed: true,
      remaining: opts.maxRequests - 1,
      resetAt: now + opts.windowMs,
    }
  }

  // Check if limit exceeded
  if (entry.count >= opts.maxRequests) {
    const resetAt = entry.firstRequest + opts.windowMs
    const retryAfter = Math.ceil((resetAt - now) / 1000)

    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfter: Math.max(1, retryAfter),
    }
  }

  // Increment count
  entry.count++
  entry.lastRequest = now
  rateLimitStore.set(key, entry)

  return {
    allowed: true,
    remaining: opts.maxRequests - entry.count,
    resetAt: entry.firstRequest + opts.windowMs,
  }
}

/**
 * Rate limit middleware helper for Next.js API routes
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  options: Partial<RateLimiterOptions> = {}
) {
  return async (request: Request): Promise<Response> => {
    // Get identifier from IP or auth header
    const identifier = getRequestIdentifier(request)
    const result = checkRateLimit(identifier, options)

    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: 'Too many requests',
          retryAfter: result.retryAfter,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(options.maxRequests || DEFAULT_OPTIONS.maxRequests),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(result.resetAt),
            'Retry-After': String(result.retryAfter),
          },
        }
      )
    }

    // Call the actual handler
    const response = await handler(request)

    // Add rate limit headers to response
    const headers = new Headers(response.headers)
    headers.set('X-RateLimit-Limit', String(options.maxRequests || DEFAULT_OPTIONS.maxRequests))
    headers.set('X-RateLimit-Remaining', String(result.remaining))
    headers.set('X-RateLimit-Reset', String(result.resetAt))

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    })
  }
}

/**
 * Get unique identifier from request
 */
function getRequestIdentifier(request: Request): string {
  // Try to get from auth header
  const authHeader = request.headers.get('Authorization')
  if (authHeader) {
    // Use hash of token as identifier
    return `auth:${hashString(authHeader)}`
  }

  // Try to get IP from various headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return `ip:${forwardedFor.split(',')[0].trim()}`
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return `ip:${realIp}`
  }

  // Fallback to a generic key (not ideal but prevents crash)
  return 'anonymous'
}

/**
 * Simple string hash
 */
function hashString(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36)
}

/**
 * Preset rate limit configurations
 */
export const RateLimitPresets = {
  // Standard API endpoints
  standard: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60,
    keyPrefix: 'api:standard',
  },

  // Strict for expensive operations
  strict: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    keyPrefix: 'api:strict',
  },

  // Lenient for read operations
  lenient: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 120,
    keyPrefix: 'api:lenient',
  },

  // Very strict for auth operations
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: 'api:auth',
  },

  // For AI operations (expensive)
  ai: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 5,
    keyPrefix: 'api:ai',
  },
} as const
