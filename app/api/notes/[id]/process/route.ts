import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { queueNoteProcessing } from '@/lib/queue/note-queue'
import { processNote } from '@/lib/note-processing-service'

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

    // Atomic check-and-update: Only proceed if note exists and is NOT already processing
    // This prevents race conditions where multiple requests try to process the same note
    const updateResult = await prisma.note.updateMany({
      where: {
        id,
        processStatus: { not: 'PROCESSING' },
      },
      data: {
        processStatus: 'PROCESSING',
        processingError: null,
      },
    })

    // If no rows updated, either note doesn't exist or is already processing
    if (updateResult.count === 0) {
      // Check if note exists
      const existingNote = await prisma.note.findUnique({
        where: { id },
        select: { id: true, processStatus: true },
      })

      if (!existingNote) {
        return NextResponse.json({ error: 'Note not found' }, { status: 404 })
      }

      // Note exists but is already processing
      return NextResponse.json(
        { error: 'Note is already being processed' },
        { status: 409 }
      )
    }

    // Successfully claimed the note for processing
    // Try to add to queue first, fallback to direct processing
    try {
      const job = await queueNoteProcessing(id)

      // Update note status to PENDING (queued for background processing)
      await prisma.note.update({
        where: { id },
        data: { processStatus: 'PENDING' },
      })

      return NextResponse.json({
        jobId: job.id,
        status: 'queued',
        message: 'Note processing queued successfully',
      })
    } catch (queueError: any) {
      // If queue fails (e.g., Redis not available), process directly
      console.log('Queue unavailable, processing directly:', queueError.message)

      const processedNote = await processNote(id)

      return NextResponse.json({
        status: 'completed',
        message: 'Note processed directly (queue unavailable)',
        note: {
          id: processedNote.id,
          processStatus: processedNote.processStatus,
          summary: processedNote.summary,
          topics: processedNote.topics,
          sentiment: processedNote.sentiment,
        },
      })
    }
  } catch (error: any) {
    console.error('Failed to process note:', error)

    return NextResponse.json(
      { error: 'Failed to process note', details: error.message },
      { status: 500 }
    )
  }
}
