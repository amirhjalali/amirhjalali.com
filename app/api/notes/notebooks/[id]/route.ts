import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/notes/notebooks/[id] - Get single notebook with its notes
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

    const notebook = await prisma.notebook.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            type: true,
            excerpt: true,
            tags: true,
            topics: true,
            imageUrl: true,
            processStatus: true,
            pinned: true,
            starred: true,
            createdAt: true,
            updatedAt: true,
          }
        },
        _count: {
          select: { notes: true }
        }
      }
    })

    if (!notebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 })
    }

    // Transform to include noteCount at top level
    const notebookWithCount = {
      ...notebook,
      noteCount: notebook._count.notes
    }

    return NextResponse.json({ notebook: notebookWithCount })
  } catch (error: any) {
    console.error('GET /api/notes/notebooks/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notebook', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/notes/notebooks/[id] - Update notebook
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
    const { title, description, color, icon } = body

    // Check if notebook exists
    const existingNotebook = await prisma.notebook.findUnique({
      where: { id }
    })

    if (!existingNotebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 })
    }

    // Build update data (only include provided fields)
    const updateData: any = {}

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json(
          { error: 'Title cannot be empty' },
          { status: 400 }
        )
      }
      updateData.title = title.trim()
    }
    if (description !== undefined) updateData.description = description
    if (color !== undefined) updateData.color = color
    if (icon !== undefined) updateData.icon = icon

    const notebook = await prisma.notebook.update({
      where: { id },
      data: updateData,
      include: {
        _count: {
          select: { notes: true }
        }
      }
    })

    // Transform to include noteCount at top level
    const notebookWithCount = {
      ...notebook,
      noteCount: notebook._count.notes
    }

    return NextResponse.json({ notebook: notebookWithCount })
  } catch (error: any) {
    console.error('PATCH /api/notes/notebooks/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update notebook', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/notes/notebooks/[id] - Delete notebook (notes get notebookId set to null)
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

    // Check if notebook exists
    const existingNotebook = await prisma.notebook.findUnique({
      where: { id }
    })

    if (!existingNotebook) {
      return NextResponse.json({ error: 'Notebook not found' }, { status: 404 })
    }

    // First, unlink all notes from this notebook
    // The Prisma schema already has onDelete: SetNull for the notebook relation,
    // but we explicitly update to ensure the operation is atomic
    await prisma.note.updateMany({
      where: { notebookId: id },
      data: { notebookId: null }
    })

    // Then delete the notebook
    await prisma.notebook.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/notes/notebooks/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete notebook', details: error.message },
      { status: 500 }
    )
  }
}
