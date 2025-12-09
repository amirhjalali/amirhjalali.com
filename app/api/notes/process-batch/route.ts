import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/actions/auth'
import { prisma } from '@/lib/prisma'
import { queueNoteProcessing } from '@/lib/queue/note-queue'

const MAX_BATCH_SIZE = 50

export async function POST(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { noteIds } = body

    if (!Array.isArray(noteIds)) {
      return NextResponse.json(
        { error: 'noteIds must be an array' },
        { status: 400 }
      )
    }

    if (noteIds.length === 0) {
      return NextResponse.json({ error: 'noteIds array is empty' }, { status: 400 })
    }

    if (noteIds.length > MAX_BATCH_SIZE) {
      return NextResponse.json(
        { error: `Maximum batch size is ${MAX_BATCH_SIZE} notes` },
        { status: 400 }
      )
    }

    // Verify all notes exist
    const notes = await prisma.note.findMany({
      where: {
        id: { in: noteIds },
      },
      select: { id: true, processStatus: true },
    })

    if (notes.length !== noteIds.length) {
      const foundIds = new Set(notes.map((n) => n.id))
      const missingIds = noteIds.filter((id) => !foundIds.has(id))

      return NextResponse.json(
        { error: 'Some notes not found', missingIds },
        { status: 404 }
      )
    }

    // Filter out notes that are already processing
    const processableNotes = notes.filter((n) => n.processStatus !== 'PROCESSING')

    if (processableNotes.length === 0) {
      return NextResponse.json(
        { error: 'All notes are already being processed' },
        { status: 409 }
      )
    }

    // Queue all notes for processing
    const jobPromises = processableNotes.map((note) => queueNoteProcessing(note.id))
    const jobs = await Promise.all(jobPromises)

    // Update all note statuses to PENDING
    await prisma.note.updateMany({
      where: {
        id: { in: processableNotes.map((n) => n.id) },
      },
      data: { processStatus: 'PENDING' },
    })

    return NextResponse.json({
      jobIds: jobs.map((job) => job.id as string),
      queued: jobs.length,
      skipped: noteIds.length - jobs.length,
      message: `${jobs.length} notes queued for processing`,
    })
  } catch (error: any) {
    console.error('Failed to queue batch processing:', error)

    return NextResponse.json(
      { error: 'Failed to queue batch processing' },
      { status: 500 }
    )
  }
}
