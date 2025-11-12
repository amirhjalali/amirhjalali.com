import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/drafts/[id] - Get single draft
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const draft = await prisma.draft.findUnique({
      where: { id: params.id }
    })

    if (!draft) {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(draft)
  } catch (error: any) {
    console.error('GET /api/drafts/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch draft', details: error.message },
      { status: 500 }
    )
  }
}

// PATCH /api/drafts/[id] - Update draft
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const draft = await prisma.draft.update({
      where: { id: params.id },
      data: body,
    })

    return NextResponse.json(draft)
  } catch (error: any) {
    console.error('PATCH /api/drafts/[id] error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update draft', details: error.message },
      { status: 500 }
    )
  }
}

// DELETE /api/drafts/[id] - Delete draft
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.draft.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true, message: 'Draft deleted' })
  } catch (error: any) {
    console.error('DELETE /api/drafts/[id] error:', error)

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Draft not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete draft', details: error.message },
      { status: 500 }
    )
  }
}
