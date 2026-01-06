/**
 * Error Handler
 * Centralized error handling and reporting
 */

import { NextResponse } from 'next/server'

// Custom error classes
export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: string
  public readonly isOperational: boolean
  public readonly details?: Record<string, any>

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: Record<string, any>
  ) {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
    this.details = details

    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR')
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Not authorized') {
    super(message, 403, 'AUTHORIZATION_ERROR')
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with id '${id}' not found` : `${resource} not found`
    super(message, 404, 'NOT_FOUND')
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT')
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number

  constructor(retryAfter: number = 60) {
    super('Too many requests', 429, 'RATE_LIMIT_EXCEEDED', { retryAfter })
    this.retryAfter = retryAfter
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string) {
    super(`${service} error: ${message}`, 502, 'EXTERNAL_SERVICE_ERROR', { service })
  }
}

/**
 * Error response interface
 */
interface ErrorResponse {
  error: string
  code: string
  details?: Record<string, any>
  stack?: string
}

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  // Log all errors
  console.error('API Error:', error)

  // Handle known AppErrors
  if (error instanceof AppError) {
    const response: ErrorResponse = {
      error: error.message,
      code: error.code,
    }

    if (error.details) {
      response.details = error.details
    }

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development' && error.stack) {
      response.stack = error.stack
    }

    const headers: Record<string, string> = {}
    if (error instanceof RateLimitError) {
      headers['Retry-After'] = String(error.retryAfter)
    }

    return NextResponse.json(response, {
      status: error.statusCode,
      headers,
    })
  }

  // Handle Prisma errors
  if (isPrismaError(error)) {
    return handlePrismaError(error)
  }

  // Handle generic errors
  const genericError = error instanceof Error ? error : new Error(String(error))
  const response: ErrorResponse = {
    error: process.env.NODE_ENV === 'development'
      ? genericError.message
      : 'Internal server error',
    code: 'INTERNAL_ERROR',
  }

  if (process.env.NODE_ENV === 'development' && genericError.stack) {
    response.stack = genericError.stack
  }

  return NextResponse.json(response, { status: 500 })
}

/**
 * Check if error is a Prisma error
 */
function isPrismaError(error: unknown): error is Error & { code: string } {
  return error instanceof Error && 'code' in error && typeof (error as any).code === 'string'
}

/**
 * Handle Prisma-specific errors
 */
function handlePrismaError(error: Error & { code: string }): NextResponse<ErrorResponse> {
  const prismaErrorMap: Record<string, { status: number; message: string }> = {
    P2002: { status: 409, message: 'A record with this value already exists' },
    P2003: { status: 400, message: 'Foreign key constraint violation' },
    P2025: { status: 404, message: 'Record not found' },
    P2016: { status: 400, message: 'Query interpretation error' },
    P2014: { status: 400, message: 'Invalid relation' },
  }

  const errorInfo = prismaErrorMap[error.code]
  if (errorInfo) {
    return NextResponse.json(
      {
        error: errorInfo.message,
        code: `PRISMA_${error.code}`,
      },
      { status: errorInfo.status }
    )
  }

  // Default Prisma error handling
  return NextResponse.json(
    {
      error: 'Database error',
      code: `PRISMA_${error.code}`,
    },
    { status: 500 }
  )
}

/**
 * Async error wrapper for API routes
 * Usage: export const GET = withErrorHandler(async (req) => { ... })
 */
export function withErrorHandler<T extends Request>(
  handler: (request: T) => Promise<Response>
) {
  return async (request: T): Promise<Response> => {
    try {
      return await handler(request)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Log error to console with context
 */
export function logError(
  error: unknown,
  context?: {
    operation?: string
    userId?: string
    noteId?: string
    [key: string]: any
  }
): void {
  const timestamp = new Date().toISOString()
  const errorDetails = {
    timestamp,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  }

  console.error('ERROR:', JSON.stringify(errorDetails, null, 2))

  // In production, you could send to error tracking service here
  // e.g., Sentry, LogRocket, etc.
}

/**
 * Retry an async operation with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    baseDelay?: number
    maxDelay?: number
    shouldRetry?: (error: unknown) => boolean
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 30000,
    shouldRetry = () => true,
  } = options

  let lastError: unknown

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error

      if (attempt === maxRetries - 1 || !shouldRetry(error)) {
        throw error
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        baseDelay * Math.pow(2, attempt) + Math.random() * 1000,
        maxDelay
      )

      console.warn(`Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

/**
 * Create a timeout promise that rejects after specified milliseconds
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  message: string = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new AppError(message, 408, 'TIMEOUT')), timeoutMs)
    ),
  ])
}
