import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession(request)

    return NextResponse.json({
      status: 'ok',
      authenticated: !!session,
      timestamp: new Date().toISOString(),
    })
  } catch {
    return NextResponse.json({
      status: 'error',
      authenticated: false,
      timestamp: new Date().toISOString(),
    })
  }
}
