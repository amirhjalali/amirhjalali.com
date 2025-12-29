import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/app/actions/auth'
import { NoteType, ProcessStatus } from '@/lib/types'
import { queueNoteProcessing } from '@/lib/queue/note-queue'

// GET /api/notes - List notes with filters
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)

    // Parse query parameters
    const type = searchParams.get('type') as NoteType | null
    const status = searchParams.get('status') as ProcessStatus | null
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || []
    const search = searchParams.get('search') || ''
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc'

    // Build where clause
    const where: any = {}

    if (type) {
      where.type = type
    }

    if (status) {
      where.processStatus = status
    }

    if (tags.length > 0) {
      where.tags = {
        hasSome: tags
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Get total count
    const total = await prisma.note.count({ where })

    // Get notes with optimized selection
    const notes = await prisma.note.findMany({
      where,
      orderBy: { [sortBy]: order },
      take: limit,
      skip: offset,
      select: {
        id: true,
        title: true,
        excerpt: true,
        tags: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        processStatus: true,
        // Fetch only a substring of content for preview if excerpt is missing
        // Note: Prisma doesn't support substring in select easily without raw query, 
        // but we can fetch content and truncate in memory if it's not too huge.
        // However, since content can be huge, let's just NOT select it and rely on excerpt.
        // If we really need a preview, we should compute 'excerpt' on save.
        // For now, let's select a few fields.
        content: false, // Explicitly exclude
        imageUrl: true,
        topics: true, // Keep lightweight arrays
      }
    })

    // Map to Note type (some optional fields might be missing)
    const safeNotes = notes.map(note => ({
      ...note,
      content: note.excerpt || '', // Fallback to excerpt or empty string for list view
    }))

    const hasMore = offset + notes.length < total

    return NextResponse.json({
      notes: safeNotes,
      total,
      hasMore
    })
  } catch (error: any) {
    console.error('GET /api/notes error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notes', details: error.message },
      { status: 500 }
    )
  }
}

import { uploadToR2 } from '@/lib/upload-utils'

// POST /api/notes - Create new note
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
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
        { error: 'Invalid note type' },
        { status: 400 }
      )
    }

    let { imageUrl, content, type } = body

    // Handle Image Uploads to R2
    try {
      // 1. Check if imageUrl is a Base64 string
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        console.log('🖼️ Uploading imageUrl to R2...')
        const contentType = imageUrl.substring(5, imageUrl.indexOf(';'))
        imageUrl = await uploadToR2(imageUrl, `note-image-${Date.now()}`, contentType)
      }

      // 2. If type is IMAGE and content is Base64, upload it
      if (type === 'IMAGE' && content.startsWith('data:image/')) {
        console.log('🖼️ Uploading content (image) to R2...')
        const contentType = content.substring(5, content.indexOf(';'))
        content = await uploadToR2(content, `note-content-${Date.now()}`, contentType)
      }
    } catch (uploadError) {
      console.error('❌ Failed to upload image to R2:', uploadError)
      // We continue even if upload fails, though the image might be broken or huge in DB
      // Alternatively, we could return an error here.
    }

    const note = await prisma.note.create({
      data: {
        type: type,
        content: content,
        imageUrl: imageUrl || null,
        title: body.title || null,
        tags: body.tags || [],
        topics: [],
        keyInsights: [],
        processStatus: 'PENDING' as ProcessStatus,
      }
    })

    // Auto-process notes by default (can be disabled with autoProcess=false)
    const autoProcess = body.autoProcess !== false // Default to true
    const enableAutoProcessing = process.env.ENABLE_AUTO_PROCESSING !== 'false' // Default to true

    let jobId: string | null = null

    if (autoProcess && enableAutoProcessing) {
      try {
        const job = await queueNoteProcessing(note.id)
        jobId = job.id as string
        console.log(`Note ${note.id} queued for automatic processing (Job: ${jobId})`)
      } catch (error) {
        console.error(`Failed to queue note ${note.id} for processing:`, error)
        // Continue without processing - non-critical error
      }
    }

    return NextResponse.json({ note, jobId }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/notes error:', error)
    return NextResponse.json(
      { error: 'Failed to create note', details: error.message },
      { status: 500 }
    )
  }
}
