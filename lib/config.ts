import { z } from 'zod'

/**
 * Environment variable validation schema
 * Validates required and optional environment variables at startup
 */
const envSchema = z.object({
  // Required: Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Required: OpenAI (for AI features)
  OPENAI_API_KEY: z.string().min(1, 'OPENAI_API_KEY is required'),

  // Optional: Redis (falls back to direct processing if not available)
  REDIS_URL: z.string().optional(),

  // Optional: R2 Storage
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().optional(),

  // Optional: Feature flags
  ENABLE_AUTO_PROCESSING: z.enum(['true', 'false']).optional().default('true'),

  // Optional: Admin credentials
  NEXT_PUBLIC_ADMIN_USERNAME: z.string().optional(),
  NEXT_PUBLIC_ADMIN_PASSWORD_HASH: z.string().optional(),

  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).optional().default('development'),
})

export type Env = z.infer<typeof envSchema>

/**
 * Validate environment variables
 * Call this at application startup to fail fast if required vars are missing
 */
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map((e) => `  - ${e.path.join('.')}: ${e.message}`)
      console.error('\n❌ Environment validation failed:\n' + missingVars.join('\n'))
      console.error('\nPlease set the required environment variables and restart.\n')

      // In development, don't crash - just warn
      if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️  Continuing in development mode with missing env vars...\n')
        return process.env as unknown as Env
      }

      throw new Error('Environment validation failed')
    }
    throw error
  }
}

/**
 * Validated environment configuration
 * Access this instead of process.env directly for type safety
 */
export const env = validateEnv()

/**
 * Check if Redis is configured
 */
export function isRedisConfigured(): boolean {
  return Boolean(env.REDIS_URL)
}

/**
 * Check if R2 storage is fully configured
 */
export function isR2Configured(): boolean {
  return Boolean(
    env.R2_ACCOUNT_ID &&
    env.R2_ACCESS_KEY_ID &&
    env.R2_SECRET_ACCESS_KEY &&
    env.R2_BUCKET_NAME
  )
}

/**
 * Check if auto-processing is enabled
 */
export function isAutoProcessingEnabled(): boolean {
  return env.ENABLE_AUTO_PROCESSING === 'true'
}
