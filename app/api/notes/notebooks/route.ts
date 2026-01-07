import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

// GET /api/notes/notebooks - List all notebooks with note counts
export async function GET(_request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const notebooks = await prisma.notebook.findMany({
      include: {
        _count: {
          select: { notes: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    // Transform to include noteCount at top level for convenience
    const notebooksWithCount = notebooks.map(notebook => ({
      ...notebook,
      noteCount: notebook._count.notes
    }))

    return NextResponse.json({ notebooks: notebooksWithCount })
  } catch (error: any) {
    console.error('GET /api/notes/notebooks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notebooks', details: error.message },
      { status: 500 }
    )
  }
}

// POST /api/notes/notebooks - Create a new notebook
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, color, icon } = body

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const notebook = await prisma.notebook.create({
      data: {
        title: title.trim(),
        description: description || null,
        color: color || '#888888',
        icon: icon || null,
      }
    })

    return NextResponse.json({ notebook }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/notes/notebooks error:', error)
    return NextResponse.json(
      { error: 'Failed to create notebook', details: error.message },
      { status: 500 }
    )
  }
}
