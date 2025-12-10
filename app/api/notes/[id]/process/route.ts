import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/actions/auth'
import { prisma } from '@/lib/db'
import { queueNoteProcessing } from '@/lib/queue/note-queue'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Check if note exists
    const note = await prisma.note.findUnique({
      where: { id },
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Check if already processing
    if (note.processStatus === 'PROCESSING') {
      return NextResponse.json(
        { error: 'Note is already being processed' },
        { status: 409 }
      )
    }

    // Add to queue
    const job = await queueNoteProcessing(id)

    // Update note status to PENDING (queue)
    await prisma.note.update({
      where: { id },
      data: { processStatus: 'PENDING' },
    })

    return NextResponse.json({
      jobId: job.id,
      status: 'queued',
      message: 'Note processing queued successfully',
    })
  } catch (error: any) {
    console.error('Failed to queue note processing:', error)

    return NextResponse.json(
      { error: 'Failed to queue processing' },
      { status: 500 }
    )
  }
}
