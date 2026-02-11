'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Archive, Home } from 'lucide-react'
import Link from 'next/link'
import SortableTask from './SortableTask'

type Task = {
  id: string
  text: string
  position: number
  staleDays: number
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export default function TodayClient() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskText, setNewTaskText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks')
      if (res.ok) {
        const data = await res.json()
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = tasks.findIndex((t) => t.id === active.id)
    const newIndex = tasks.findIndex((t) => t.id === over.id)

    const newTasks = arrayMove(tasks, oldIndex, newIndex)
    setTasks(newTasks)

    try {
      await fetch(`/api/tasks/${active.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: true, taskIds: newTasks.map((t) => t.id) }),
      })
      fetchTasks()
    } catch (error) {
      console.error('Failed to reorder:', error)
      fetchTasks()
    }
  }

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskText.trim() || tasks.length >= 10 || isAdding) return

    setIsAdding(true)
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newTaskText.trim() }),
      })
      if (res.ok) {
        setNewTaskText('')
        fetchTasks()
      }
    } catch (error) {
      console.error('Failed to add task:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleComplete = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ complete: true }),
      })
    } catch (error) {
      console.error('Failed to complete task:', error)
      fetchTasks()
    }
  }

  const handleDelete = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    try {
      await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
    } catch (error) {
      console.error('Failed to delete task:', error)
      fetchTasks()
    }
  }

  const handleUpdate = async (id: string, text: string) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      fetchTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] flex flex-col pb-safe">
      <header className="p-6 pb-4 pt-safe">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 -ml-2 hover:bg-white/5 rounded-lg transition-colors"
              title="Home"
            >
              <Home className="w-5 h-5 text-[#888888]" />
            </Link>
            <div>
              <h1 className="text-4xl font-serif font-light">Today</h1>
              <p className="text-[#888888] font-mono text-xs uppercase tracking-widest mt-1">
                {today}
              </p>
            </div>
          </div>
          <Link
            href="/today/archive"
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            title="Archive"
          >
            <Archive className="w-5 h-5 text-[#888888]" />
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 pb-32">
        <div className="max-w-lg mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#888888] font-mono text-sm">No tasks for today</p>
              <p className="text-[#555555] font-mono text-xs mt-2">Add one below to get started</p>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-2">
                  <AnimatePresence mode="popLayout">
                    {tasks.map((task) => (
                      <SortableTask
                        key={task.id}
                        task={task}
                        onComplete={handleComplete}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                      />
                    ))}
                  </AnimatePresence>
                </ul>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-12">
        <form onSubmit={handleAddTask} className="max-w-lg mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder={tasks.length >= 10 ? 'Max 10 tasks reached' : 'Add a task...'}
              disabled={tasks.length >= 10 || isAdding}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-[#EAEAEA] placeholder:text-[#555555] transition-all font-mono text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!newTaskText.trim() || tasks.length >= 10 || isAdding}
              className="px-6 py-3 bg-white text-black font-mono text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-[#EAEAEA] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? '...' : 'Add'}
            </button>
          </div>
          <p className="text-center text-[#555555] font-mono text-[10px] mt-3">
            {tasks.length}/10 tasks
          </p>
        </form>
      </div>
    </div>
  )
}
