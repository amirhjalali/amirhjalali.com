import { NextResponse } from 'next/server'
import { getSession } from '@/app/actions/auth'
import { getRedisConnection } from '@/lib/redis'

export async function GET() {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const redis = getRedisConnection()
        const start = Date.now()
        await redis.ping()
        const latency = Date.now() - start

        return NextResponse.json({
            status: 'ok',
            latency: `${latency}ms`,
            timestamp: new Date().toISOString()
        })
    } catch (error: any) {
        console.error('Redis health check failed:', error)
        return NextResponse.json(
            { status: 'error', message: error.message },
            { status: 500 }
        )
    }
}
