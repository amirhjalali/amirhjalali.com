import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/app/actions/auth'

// GET /api/notes/[id] - Get single note by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const note = await prisma.note.findUnique({
      where: { id },
      include: {
        articleRefs: {
          include: {
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
              }
            }
          }
        }
      }
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json(note)
  } catch (error: any) {
    console.error('GET /api/notes/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch note', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/notes/[id] - Update note
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await request.json()

    // Check if note exists
    const existingNote = await prisma.note.findUnique({
      where: { id }
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Build update data (only allow specific fields)
    const updateData: any = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt
    if (body.metadata !== undefined) updateData.metadata = body.metadata
    if (body.content !== undefined) updateData.content = body.content

    const note = await prisma.note.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(note)
  } catch (error: any) {
    console.error('PATCH /api/notes/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update note', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/notes/[id] - Delete note
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Check if note exists
    const existingNote = await prisma.note.findUnique({
      where: { id }
    })

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    await prisma.note.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/notes/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete note', details: error.message },
      { status: 500 }
    )
  }
}
