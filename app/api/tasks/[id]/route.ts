import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/actions/auth'
import { updateTask, completeTask, deleteTask, reorderTasks } from '@/lib/db/tasks'

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

    // Handle reorder operation
    if (body.reorder && Array.isArray(body.taskIds)) {
      const tasks = await reorderTasks(body.taskIds)
      return NextResponse.json({ tasks })
    }

    // Handle complete operation
    if (body.complete === true) {
      const task = await completeTask(id)
      return NextResponse.json({ task })
    }

    // Handle text/position update
    const updateData: { text?: string; position?: number } = {}
    if (typeof body.text === 'string') {
      updateData.text = body.text.trim()
    }
    if (typeof body.position === 'number') {
      updateData.position = body.position
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid update data provided' }, { status: 400 })
    }

    const task = await updateTask(id, updateData)
    return NextResponse.json({ task })
  } catch (error: any) {
    console.error('PATCH /api/tasks/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update task', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    await deleteTask(id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/tasks/[id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete task', details: error.message },
      { status: 500 }
    )
  }
}
