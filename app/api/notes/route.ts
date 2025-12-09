import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/app/actions/auth'
import { NoteType, ProcessStatus } from '@/lib/types'

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

    // Get notes
    const notes = await prisma.note.findMany({
      where,
      orderBy: { [sortBy]: order },
      take: limit,
      skip: offset,
    })

    const hasMore = offset + notes.length < total

    return NextResponse.json({
      notes,
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

    const note = await prisma.note.create({
      data: {
        type: body.type,
        content: body.content,
        title: body.title || null,
        tags: body.tags || [],
        topics: [],
        keyInsights: [],
        processStatus: 'PENDING' as ProcessStatus,
      }
    })

    // TODO: Queue for processing if autoProcess is true
    // This will be implemented in Phase 2 (M2.10)

    return NextResponse.json({ note, jobId: null }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/notes error:', error)
    return NextResponse.json(
      { error: 'Failed to create note', details: error.message },
      { status: 500 }
    )
  }
}
