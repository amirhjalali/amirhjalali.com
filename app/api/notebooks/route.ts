import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/actions/auth'
import { prisma } from '@/lib/db'

// GET /api/notebooks - List all notebooks
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const notebooks = await prisma.notebook.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { notes: true },
        },
      },
    })

    // Transform to include note count
    const result = notebooks.map(nb => ({
      ...nb,
      noteCount: nb._count.notes,
      _count: undefined,
    }))

    return NextResponse.json({ notebooks: result })
  } catch (error: any) {
    console.error('List notebooks error:', error)
    return NextResponse.json(
      { error: 'Failed to list notebooks' },
      { status: 500 }
    )
  }
}

// POST /api/notebooks - Create a new notebook
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, description, color, icon } = body

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const notebook = await prisma.notebook.create({
      data: {
        title,
        description,
        color,
        icon,
      },
    })

    return NextResponse.json({ notebook }, { status: 201 })
  } catch (error: any) {
    console.error('Create notebook error:', error)
    return NextResponse.json(
      { error: 'Failed to create notebook' },
      { status: 500 }
    )
  }
}
