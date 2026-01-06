/**
 * API Helpers
 * Combines rate limiting, error handling, and other utilities for API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { checkRateLimit, RateLimitPresets } from '@/lib/rate-limiter'
import {
  handleApiError,
  AuthenticationError,
  RateLimitError,
} from '@/lib/error-handler'

type RateLimitPreset = keyof typeof RateLimitPresets

interface ApiHandlerOptions {
  /** Rate limit preset to use */
  rateLimit?: RateLimitPreset | false
  /** Custom rate limit options */
  rateLimitOptions?: {
    windowMs?: number
    maxRequests?: number
    keyPrefix?: string
  }
  /** Whether authentication is required (default: true) */
  requireAuth?: boolean
  /** Whether to allow cron access with CRON_SECRET */
  allowCron?: boolean
}

type ApiHandler = (request: NextRequest) => Promise<Response>

/**
 * Wrap an API handler with rate limiting and error handling
 */
export function withApiMiddleware(
  handler: ApiHandler,
  options: ApiHandlerOptions = {}
): ApiHandler {
  const {
    rateLimit = 'standard',
    rateLimitOptions,
    requireAuth = true,
    allowCron = false,
  } = options

  return async (request: NextRequest): Promise<Response> => {
    try {
      // Check cron access first
      if (allowCron) {
        const authHeader = request.headers.get('authorization')
        const isCron = process.env.CRON_SECRET && authHeader === `Bearer ${process.env.CRON_SECRET}`
        if (isCron) {
          // Skip auth and rate limiting for cron jobs
          return await handler(request)
        }
      }

      // Check authentication
      if (requireAuth) {
        const session = await getSession()
        if (!session) {
          throw new AuthenticationError()
        }
      }

      // Check rate limit
      if (rateLimit !== false) {
        const identifier = getRequestIdentifier(request)
        const rateLimitConfig = rateLimitOptions || RateLimitPresets[rateLimit]
        const result = checkRateLimit(identifier, rateLimitConfig)

        if (!result.allowed) {
          throw new RateLimitError(result.retryAfter)
        }

        // Execute handler
        const response = await handler(request)

        // Add rate limit headers
        const headers = new Headers(response.headers)
        headers.set('X-RateLimit-Limit', String(rateLimitConfig.maxRequests))
        headers.set('X-RateLimit-Remaining', String(result.remaining))
        headers.set('X-RateLimit-Reset', String(result.resetAt))

        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers,
        })
      }

      // No rate limiting, just execute handler
      return await handler(request)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Get unique identifier from request for rate limiting
 */
function getRequestIdentifier(request: NextRequest): string {
  // Try auth header first
  const authHeader = request.headers.get('Authorization')
  if (authHeader) {
    return `auth:${hashString(authHeader)}`
  }

  // Try IP headers
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return `ip:${forwardedFor.split(',')[0].trim()}`
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return `ip:${realIp}`
  }

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
    hash = hash & hash
  }
  return Math.abs(hash).toString(36)
}

/**
 * Validate request body against a schema
 */
export function validateBody<T>(
  body: unknown,
  validator: (data: unknown) => { success: boolean; data?: T; error?: any }
): T {
  const result = validator(body)
  if (!result.success) {
    throw new Error(`Validation failed: ${JSON.stringify(result.error)}`)
  }
  return result.data as T
}

/**
 * Create a paginated response
 */
export function paginatedResponse<T>(
  items: T[],
  total: number,
  offset: number,
  limit: number
) {
  return NextResponse.json({
    items,
    total,
    offset,
    limit,
    hasMore: offset + items.length < total,
    page: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(total / limit),
  })
}

/**
 * Parse pagination params from request
 */
export function parsePagination(request: NextRequest): {
  limit: number
  offset: number
} {
  const { searchParams } = new URL(request.url)
  const limit = Math.min(
    Math.max(parseInt(searchParams.get('limit') || '50', 10), 1),
    250
  )
  const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0)
  return { limit, offset }
}

/**
 * Parse sorting params from request
 */
export function parseSorting(request: NextRequest, allowedFields: string[]): {
  sortBy: string
  order: 'asc' | 'desc'
} {
  const { searchParams } = new URL(request.url)
  const sortBy = searchParams.get('sortBy') || 'createdAt'
  const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'

  // Validate sort field
  const validSortBy = allowedFields.includes(sortBy) ? sortBy : 'createdAt'

  return { sortBy: validSortBy, order }
}
