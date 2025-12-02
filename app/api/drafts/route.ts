import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/drafts - List all drafts
export async function GET(_request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const drafts = await prisma.draft.findMany({
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(drafts)
  } catch (error: any) {
    console.error('GET /api/drafts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drafts', details: error.message },
      { status: 500 }
    )
  }
}

import { getSession } from '@/app/actions/auth'

// POST /api/drafts - Create new draft
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    const draft = await prisma.draft.create({
      data: {
        title: body.title,
        content: body.content,
        excerpt: body.excerpt || null,
        tags: body.tags || [],
        imageUrl: body.imageUrl || null,
        aiGenerated: body.aiGenerated || false,
      }
    })

    return NextResponse.json(draft, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/drafts error:', error)
    return NextResponse.json(
      { error: 'Failed to create draft', details: error.message },
      { status: 500 }
    )
  }
}
