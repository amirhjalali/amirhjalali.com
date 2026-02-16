import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { NoteType, ProcessStatus } from '@/lib/types'
import { queueNoteProcessing } from '@/lib/queue/note-queue'

/**
 * POST /api/notes/ingest - Create notes via API key (no session required)
 * 
 * Used by MrAI to ingest notes from forwarded emails.
 * Requires MRAI_INGEST_KEY environment variable to be set.
 * 
 * Body: { type: NoteType, content: string, title?: string, tags?: string[], sourceUrl?: string }
 * Header: Authorization: Bearer <MRAI_INGEST_KEY>
 */
export async function POST(request: NextRequest) {
  // Validate API key
  const authHeader = request.headers.get('authorization')
  const apiKey = authHeader?.replace('Bearer ', '')
  const expectedKey = process.env.MRAI_INGEST_KEY

  if (!expectedKey || !apiKey || apiKey !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    // Validate required fields
    if (!body.type || !body.content) {
      return NextResponse.json(
        { error: 'Missing required fields: type and content' },
        { status: 400 }
      )
    }

    // Validate note type
    const validTypes: NoteType[] = ['LINK', 'TEXT', 'IMAGE', 'VIDEO']
    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { error: 'Invalid note type. Must be one of: LINK, TEXT, IMAGE, VIDEO' },
        { status: 400 }
      )
    }

    // Create the note
    const note = await prisma.note.create({
      data: {
        type: body.type,
        content: body.content,
        title: body.title || null,
        tags: body.tags || [],
        sourceUrl: body.sourceUrl || null,
        topics: [],
        keyInsights: [],
        processStatus: 'PENDING' as ProcessStatus,
        metadata: body.metadata || undefined,
      }
    })

    // Queue for processing (extract content, AI analysis, embeddings, etc.)
    let jobId: string | null = null
    const enableAutoProcessing = process.env.ENABLE_AUTO_PROCESSING !== 'false'

    if (enableAutoProcessing) {
      try {
        const job = await queueNoteProcessing(note.id)
        jobId = job.id as string
        console.log(`[Ingest] Note ${note.id} queued for processing (Job: ${jobId})`)
      } catch (error) {
        console.error(`[Ingest] Failed to queue note ${note.id}:`, error)
        // Non-critical — note is created, can be processed later
      }
    }

    return NextResponse.json({ note: { id: note.id, type: note.type, title: note.title }, jobId }, { status: 201 })
  } catch (error: any) {
    console.error('[Ingest] Error:', error)
    return NextResponse.json(
      { error: 'Failed to create note', details: error.message },
      { status: 500 }
    )
  }
}
