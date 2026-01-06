/**
 * API route for note tag management
 * GET /api/notes/[id]/tags - Get tag suggestions for a note
 * POST /api/notes/[id]/tags - Add a tag to a note
 * DELETE /api/notes/[id]/tags - Remove a tag from a note
 */

import { NextRequest, NextResponse } from 'next/server'
import {
  getTagSuggestions,
  recordManualTagAddition,
  removeTagFromNote,
  applyTagSuggestions,
} from '@/lib/auto-tagging-service'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: noteId } = await params
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Verify note exists
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { id: true },
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    const suggestions = await getTagSuggestions(noteId, limit)

    return NextResponse.json({
      noteId,
      suggestions,
    })
  } catch (error: any) {
    console.error('Failed to get tag suggestions:', error)
    return NextResponse.json(
      { error: 'Failed to get tag suggestions', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: noteId } = await params
    const body = await request.json()
    const { tag, tags, autoExtracted = false } = body

    // Verify note exists
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { id: true },
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    // Handle single tag or multiple tags
    if (tags && Array.isArray(tags)) {
      await applyTagSuggestions(noteId, tags, autoExtracted)
      return NextResponse.json({
        noteId,
        message: `${tags.length} tags added successfully`,
        tags,
      })
    } else if (tag) {
      if (autoExtracted) {
        await applyTagSuggestions(noteId, [tag], true)
      } else {
        await recordManualTagAddition(noteId, tag)
      }
      return NextResponse.json({
        noteId,
        message: 'Tag added successfully',
        tag,
      })
    } else {
      return NextResponse.json(
        { error: 'Missing tag or tags in request body' },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Failed to add tag:', error)
    return NextResponse.json(
      { error: 'Failed to add tag', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: noteId } = await params
    const body = await request.json()
    const { tag } = body

    if (!tag) {
      return NextResponse.json(
        { error: 'Missing tag in request body' },
        { status: 400 }
      )
    }

    // Verify note exists
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      select: { id: true },
    })

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    await removeTagFromNote(noteId, tag)

    return NextResponse.json({
      noteId,
      message: 'Tag removed successfully',
      tag,
    })
  } catch (error: any) {
    console.error('Failed to remove tag:', error)
    return NextResponse.json(
      { error: 'Failed to remove tag', details: error.message },
      { status: 500 }
    )
  }
}
