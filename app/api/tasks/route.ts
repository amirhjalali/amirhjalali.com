import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/actions/auth'
import { getActiveTasks, getCompletedTasks, getTaskStats, createTask } from '@/lib/db/tasks'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const archived = searchParams.get('archived') === 'true'
    const stats = searchParams.get('stats') === 'true'

    if (stats) {
      const taskStats = await getTaskStats()
      return NextResponse.json(taskStats)
    }

    if (archived) {
      const limit = parseInt(searchParams.get('limit') || '50')
      const offset = parseInt(searchParams.get('offset') || '0')
      const tasks = await getCompletedTasks(limit, offset)
      return NextResponse.json({ tasks })
    }

    const tasks = await getActiveTasks()
    return NextResponse.json({ tasks })
  } catch (error: any) {
    console.error('GET /api/tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tasks', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (!body.text || typeof body.text !== 'string' || body.text.trim() === '') {
      return NextResponse.json({ error: 'Task text is required' }, { status: 400 })
    }

    const task = await createTask(body.text.trim())
    return NextResponse.json({ task }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Maximum 10 active tasks allowed') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    console.error('POST /api/tasks error:', error)
    return NextResponse.json(
      { error: 'Failed to create task', details: error.message },
      { status: 500 }
    )
  }
}
