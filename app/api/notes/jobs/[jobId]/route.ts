import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/actions/auth'
import { getJobStatus } from '@/lib/queue/note-queue'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { jobId } = await params

    const jobStatus = await getJobStatus(jobId)

    if (!jobStatus) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Map BullMQ states to our simplified status
    const statusMapping: Record<string, string> = {
      waiting: 'pending',
      delayed: 'pending',
      active: 'processing',
      completed: 'completed',
      failed: 'failed',
    }

    return NextResponse.json({
      jobId: jobStatus.id,
      status: statusMapping[jobStatus.state] || jobStatus.state,
      progress: jobStatus.progress,
      result: jobStatus.result,
      error: jobStatus.error,
      attempts: jobStatus.attempts,
      maxAttempts: jobStatus.maxAttempts,
    })
  } catch (error: any) {
    console.error('Failed to fetch job status:', error)

    return NextResponse.json(
      { error: 'Failed to fetch job status' },
      { status: 500 }
    )
  }
}
