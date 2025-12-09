import { Redis } from 'ioredis'

let redis: Redis | null = null

export function getRedisConnection(): Redis {
  if (!redis) {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

    redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      reconnectOnError(err) {
        const targetError = 'READONLY'
        if (err.message.includes(targetError)) {
          // Only reconnect when the error contains "READONLY"
          return true
        }
        return false
      },
    })

    redis.on('error', (err) => {
      console.error('Redis connection error:', err)
    })

    redis.on('connect', () => {
      console.log('Redis connected successfully')
    })
  }

  return redis
}

export async function closeRedisConnection(): Promise<void> {
  if (redis) {
    await redis.quit()
    redis = null
  }
}

// Test connection helper
export async function testRedisConnection(): Promise<boolean> {
  try {
    const connection = getRedisConnection()
    await connection.ping()
    console.log('✅ Redis connection test successful')
    return true
  } catch (error) {
    console.error('❌ Redis connection test failed:', error)
    return false
  }
}
