import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
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

    // Queue all notes for processing using Promise.allSettled for partial success handling
    const jobResults = await Promise.allSettled(
      processableNotes.map(async (note) => ({
        noteId: note.id,
        job: await queueNoteProcessing(note.id),
      }))
    )

    // Separate successful and failed jobs
    const successfulJobs: { noteId: string; jobId: string }[] = []
    const failedJobs: { noteId: string; error: string }[] = []

    for (const result of jobResults) {
      if (result.status === 'fulfilled') {
        successfulJobs.push({
          noteId: result.value.noteId,
          jobId: result.value.job.id as string,
        })
      } else {
        // Find the note ID from the original array based on index
        const index = jobResults.indexOf(result)
        failedJobs.push({
          noteId: processableNotes[index].id,
          error: result.reason?.message || 'Unknown error',
        })
      }
    }

    // Update only successfully queued notes to PENDING
    if (successfulJobs.length > 0) {
      await prisma.note.updateMany({
        where: {
          id: { in: successfulJobs.map((j) => j.noteId) },
        },
        data: { processStatus: 'PENDING' },
      })
    }

    return NextResponse.json({
      jobIds: successfulJobs.map((j) => j.jobId),
      queued: successfulJobs.length,
      failed: failedJobs.length,
      skipped: noteIds.length - processableNotes.length,
      failedNotes: failedJobs.length > 0 ? failedJobs : undefined,
      message: `${successfulJobs.length} notes queued for processing${failedJobs.length > 0 ? `, ${failedJobs.length} failed` : ''}`,
    })
  } catch (error: any) {
    console.error('Failed to queue batch processing:', error)

    return NextResponse.json(
      { error: 'Failed to queue batch processing' },
      { status: 500 }
    )
  }
}
