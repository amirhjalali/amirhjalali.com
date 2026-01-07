# Daily Todo Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a simple, beautiful daily todo page at `/today` with max 10 tasks, drag-drop reordering, staleness visual atrophy, and archive with analytics.

**Architecture:** Database-backed with Prisma, reusing existing auth system. Client-side drag-drop with @dnd-kit. Server components for pages with client components for interactivity.

**Tech Stack:** Next.js 15, Prisma, PostgreSQL, @dnd-kit/core + @dnd-kit/sortable, Framer Motion

---

## Task 1: Add DailyTask to Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

**Step 1: Add the DailyTask model to schema**

Add at the end of `prisma/schema.prisma`:

```prisma
// Daily Todo Tasks
model DailyTask {
  id          String    @id @default(cuid())
  text        String
  position    Int       // 0-9 for ordering
  completedAt DateTime? // NULL if active, set when done
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([completedAt, position])
  @@index([completedAt, createdAt])
}
```

**Step 2: Generate Prisma client**

Run: `npx prisma generate`
Expected: "Generated Prisma Client"

**Step 3: Create migration**

Run: `npx prisma migrate dev --name add_daily_tasks`
Expected: Migration created and applied

**Step 4: Commit**

```bash
git add prisma/
git commit -m "feat: add DailyTask model for daily todo page"
```

---

## Task 2: Install @dnd-kit Dependencies

**Step 1: Install packages**

Run: `npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
Expected: Packages added to package.json

**Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @dnd-kit for drag-drop functionality"
```

---

## Task 3: Create Task Database Helper Functions

**Files:**
- Create: `lib/db/tasks.ts`

**Step 1: Create the tasks helper file**

```typescript
import { prisma } from '@/lib/db'

export type TaskWithStaleness = {
  id: string
  text: string
  position: number
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  staleDays: number
}

function calculateStaleDays(updatedAt: Date): number {
  const now = new Date()
  const diffMs = now.getTime() - updatedAt.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

export async function getActiveTasks(): Promise<TaskWithStaleness[]> {
  const tasks = await prisma.dailyTask.findMany({
    where: { completedAt: null },
    orderBy: { position: 'asc' },
  })
  return tasks.map(task => ({
    ...task,
    staleDays: calculateStaleDays(task.updatedAt),
  }))
}

export async function getCompletedTasks(limit = 100, offset = 0) {
  return prisma.dailyTask.findMany({
    where: { completedAt: { not: null } },
    orderBy: { completedAt: 'desc' },
    take: limit,
    skip: offset,
  })
}

export async function getTaskStats() {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [weekCount, monthCount, totalCount] = await Promise.all([
    prisma.dailyTask.count({
      where: {
        completedAt: { not: null, gte: weekAgo },
      },
    }),
    prisma.dailyTask.count({
      where: {
        completedAt: { not: null, gte: monthAgo },
      },
    }),
    prisma.dailyTask.count({
      where: { completedAt: { not: null } },
    }),
  ])

  return {
    thisWeek: weekCount,
    thisMonth: monthCount,
    allTime: totalCount,
    weeklyAvg: Math.round((weekCount / 7) * 10) / 10,
    monthlyAvg: Math.round((monthCount / 30) * 10) / 10,
  }
}

export async function createTask(text: string) {
  const activeCount = await prisma.dailyTask.count({
    where: { completedAt: null },
  })

  if (activeCount >= 10) {
    throw new Error('Maximum 10 active tasks allowed')
  }

  return prisma.dailyTask.create({
    data: {
      text,
      position: activeCount,
    },
  })
}

export async function updateTask(id: string, data: { text?: string; position?: number }) {
  return prisma.dailyTask.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date(), // Explicitly reset to refresh staleness
    },
  })
}

export async function completeTask(id: string) {
  return prisma.dailyTask.update({
    where: { id },
    data: { completedAt: new Date() },
  })
}

export async function deleteTask(id: string) {
  return prisma.dailyTask.delete({
    where: { id },
  })
}

export async function reorderTasks(taskIds: string[]) {
  const updates = taskIds.map((id, index) =>
    prisma.dailyTask.update({
      where: { id },
      data: { position: index, updatedAt: new Date() },
    })
  )
  return prisma.$transaction(updates)
}
```

**Step 2: Commit**

```bash
git add lib/db/tasks.ts
git commit -m "feat: add task database helper functions"
```

---

## Task 4: Create Tasks API Route - GET & POST

**Files:**
- Create: `app/api/tasks/route.ts`

**Step 1: Create the API route**

```typescript
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
```

**Step 2: Commit**

```bash
git add app/api/tasks/route.ts
git commit -m "feat: add GET and POST endpoints for tasks API"
```

---

## Task 5: Create Tasks API Route - PATCH & DELETE

**Files:**
- Create: `app/api/tasks/[id]/route.ts`

**Step 1: Create the dynamic route**

```typescript
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
```

**Step 2: Commit**

```bash
git add app/api/tasks/[id]/route.ts
git commit -m "feat: add PATCH and DELETE endpoints for individual tasks"
```

---

## Task 6: Create Today Page Server Component

**Files:**
- Create: `app/today/page.tsx`

**Step 1: Create the page component**

```typescript
import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import TodayClient from './TodayClient'

export const metadata = {
  title: 'Today | Amir H. Jalali',
  description: 'Daily task management',
}

export default async function TodayPage() {
  const session = await getSession()

  if (!session) {
    redirect('/admin/login?redirectTo=/today')
  }

  return <TodayClient />
}
```

**Step 2: Commit**

```bash
git add app/today/page.tsx
git commit -m "feat: add Today page server component with auth"
```

---

## Task 7: Create Today Client Component - Layout & State

**Files:**
- Create: `app/today/TodayClient.tsx`

**Step 1: Create the client component with basic structure**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { Archive } from 'lucide-react'
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

    // Persist reorder
    try {
      await fetch(`/api/tasks/${active.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reorder: true, taskIds: newTasks.map((t) => t.id) }),
      })
      fetchTasks() // Refresh to get updated staleness
    } catch (error) {
      console.error('Failed to reorder:', error)
      fetchTasks() // Revert on error
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
    // Optimistic update
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
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] flex flex-col">
      {/* Header */}
      <header className="p-6 pb-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-serif font-light">Today</h1>
            <p className="text-[#888888] font-mono text-xs uppercase tracking-widest mt-1">
              {today}
            </p>
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

      {/* Task List */}
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

      {/* Add Task Input - Fixed at Bottom */}
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
```

**Step 2: Commit**

```bash
git add app/today/TodayClient.tsx
git commit -m "feat: add TodayClient component with task list and drag-drop"
```

---

## Task 8: Create SortableTask Component

**Files:**
- Create: `app/today/SortableTask.tsx`

**Step 1: Create the sortable task component**

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Check, X } from 'lucide-react'

type Task = {
  id: string
  text: string
  staleDays: number
}

type Props = {
  task: Task
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, text: string) => void
}

function getStalenessColor(staleDays: number): string {
  if (staleDays === 0) return 'text-[#EAEAEA]'
  if (staleDays === 1) return 'text-[#BBBBBB]'
  if (staleDays <= 3) return 'text-[#888888]'
  return 'text-[#555555]'
}

export default function SortableTask({ task, onComplete, onDelete, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)
  const [showDelete, setShowDelete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== task.text) {
      onUpdate(task.id, trimmed)
    } else {
      setEditText(task.text)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditText(task.text)
      setIsEditing(false)
    }
  }

  return (
    <motion.li
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl group ${
        isDragging ? 'shadow-lg shadow-white/5' : ''
      }`}
      onMouseEnter={() => setShowDelete(true)}
      onMouseLeave={() => setShowDelete(false)}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="touch-none p-1 text-[#555555] hover:text-[#888888] cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Task Text */}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editText}
          onChange={(e) => setEditText(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-b border-white/20 py-1 focus:outline-none focus:border-white/40 text-[#EAEAEA] font-mono text-sm"
        />
      ) : (
        <span
          onClick={() => setIsEditing(true)}
          className={`flex-1 font-mono text-sm cursor-text ${getStalenessColor(task.staleDays)}`}
        >
          {task.text}
        </span>
      )}

      {/* Delete Button (Desktop) */}
      <button
        onClick={() => onDelete(task.id)}
        className={`p-1 text-[#555555] hover:text-[#888888] transition-opacity ${
          showDelete ? 'opacity-100' : 'opacity-0'
        } md:block hidden`}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Complete Checkbox */}
      <button
        onClick={() => onComplete(task.id)}
        className="p-2 border border-white/20 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all"
      >
        <Check className="w-4 h-4 text-[#888888]" />
      </button>
    </motion.li>
  )
}
```

**Step 2: Commit**

```bash
git add app/today/SortableTask.tsx
git commit -m "feat: add SortableTask component with edit, delete, complete"
```

---

## Task 9: Create Archive Page Server Component

**Files:**
- Create: `app/today/archive/page.tsx`

**Step 1: Create the archive page**

```typescript
import { getSession } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import ArchiveClient from './ArchiveClient'

export const metadata = {
  title: 'Archive | Today',
  description: 'Completed tasks history',
}

export default async function ArchivePage() {
  const session = await getSession()

  if (!session) {
    redirect('/admin/login?redirectTo=/today/archive')
  }

  return <ArchiveClient />
}
```

**Step 2: Commit**

```bash
git add app/today/archive/page.tsx
git commit -m "feat: add Archive page server component"
```

---

## Task 10: Create Archive Client Component

**Files:**
- Create: `app/today/archive/ArchiveClient.tsx`

**Step 1: Create the archive client component**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'

type CompletedTask = {
  id: string
  text: string
  completedAt: string
}

type Stats = {
  thisWeek: number
  thisMonth: number
  allTime: number
  weeklyAvg: number
  monthlyAvg: number
}

function groupTasksByDate(tasks: CompletedTask[]) {
  const groups: Record<string, CompletedTask[]> = {}
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const task of tasks) {
    const date = new Date(task.completedAt)
    date.setHours(0, 0, 0, 0)

    let key: string
    if (date.getTime() === today.getTime()) {
      key = 'Today'
    } else if (date.getTime() === yesterday.getTime()) {
      key = 'Yesterday'
    } else {
      key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    if (!groups[key]) groups[key] = []
    groups[key].push(task)
  }

  return groups
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

export default function ArchiveClient() {
  const [tasks, setTasks] = useState<CompletedTask[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [tasksRes, statsRes] = await Promise.all([
          fetch('/api/tasks?archived=true'),
          fetch('/api/tasks?stats=true'),
        ])

        if (tasksRes.ok) {
          const data = await tasksRes.json()
          setTasks(data.tasks)
        }
        if (statsRes.ok) {
          const data = await statsRes.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch archive:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const groupedTasks = groupTasksByDate(tasks)

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA]">
      {/* Header */}
      <header className="p-6 pb-4">
        <div className="max-w-lg mx-auto">
          <Link
            href="/today"
            className="inline-flex items-center gap-2 text-[#888888] hover:text-[#EAEAEA] transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono text-xs uppercase tracking-widest">Back to Today</span>
          </Link>
          <h1 className="text-4xl font-serif font-light">Archive</h1>
        </div>
      </header>

      <main className="px-6 pb-12">
        <div className="max-w-lg mx-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Stats */}
              {stats && (
                <div className="grid grid-cols-3 gap-3 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl text-center"
                  >
                    <p className="text-2xl font-serif font-light">{stats.thisWeek}</p>
                    <p className="text-[#888888] font-mono text-[10px] uppercase tracking-widest mt-1">
                      This Week
                    </p>
                    <p className="text-[#555555] font-mono text-[10px] mt-1">
                      {stats.weeklyAvg}/day avg
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl text-center"
                  >
                    <p className="text-2xl font-serif font-light">{stats.thisMonth}</p>
                    <p className="text-[#888888] font-mono text-[10px] uppercase tracking-widest mt-1">
                      This Month
                    </p>
                    <p className="text-[#555555] font-mono text-[10px] mt-1">
                      {stats.monthlyAvg}/day avg
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-4 bg-white/5 border border-white/10 rounded-xl text-center"
                  >
                    <p className="text-2xl font-serif font-light">{stats.allTime}</p>
                    <p className="text-[#888888] font-mono text-[10px] uppercase tracking-widest mt-1">
                      All Time
                    </p>
                  </motion.div>
                </div>
              )}

              {/* Task History */}
              {Object.keys(groupedTasks).length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#888888] font-mono text-sm">No completed tasks yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedTasks).map(([date, dateTasks]) => (
                    <div key={date}>
                      <h2 className="text-[#888888] font-mono text-xs uppercase tracking-widest mb-3 border-b border-white/10 pb-2">
                        {date}
                      </h2>
                      <ul className="space-y-2">
                        {dateTasks.map((task) => (
                          <motion.li
                            key={task.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3 py-2"
                          >
                            <Check className="w-4 h-4 text-[#555555]" />
                            <span className="flex-1 text-[#888888] font-mono text-sm line-through">
                              {task.text}
                            </span>
                            <span className="text-[#555555] font-mono text-xs">
                              {formatTime(task.completedAt)}
                            </span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/today/archive/ArchiveClient.tsx
git commit -m "feat: add ArchiveClient with stats and task history"
```

---

## Task 11: Add Mobile Swipe-to-Delete

**Files:**
- Modify: `app/today/SortableTask.tsx`

**Step 1: Update SortableTask with swipe gesture**

Replace the entire `SortableTask.tsx` with updated version that includes mobile swipe:

```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Check, X, Trash2 } from 'lucide-react'

type Task = {
  id: string
  text: string
  staleDays: number
}

type Props = {
  task: Task
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, text: string) => void
}

function getStalenessColor(staleDays: number): string {
  if (staleDays === 0) return 'text-[#EAEAEA]'
  if (staleDays === 1) return 'text-[#BBBBBB]'
  if (staleDays <= 3) return 'text-[#888888]'
  return 'text-[#555555]'
}

const SWIPE_THRESHOLD = -80

export default function SortableTask({ task, onComplete, onDelete, onUpdate }: Props) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(task.text)
  const [showDelete, setShowDelete] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const x = useMotionValue(0)
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0])
  const deleteScale = useTransform(x, [-100, -50, 0], [1, 0.8, 0.5])

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const trimmed = editText.trim()
    if (trimmed && trimmed !== task.text) {
      onUpdate(task.id, trimmed)
    } else {
      setEditText(task.text)
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditText(task.text)
      setIsEditing(false)
    }
  }

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < SWIPE_THRESHOLD) {
      onDelete(task.id)
    }
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Delete Background */}
      <motion.div
        className="absolute inset-y-0 right-0 flex items-center justify-end pr-4 rounded-xl bg-white/10"
        style={{ opacity: deleteOpacity }}
      >
        <motion.div style={{ scale: deleteScale }}>
          <Trash2 className="w-5 h-5 text-[#888888]" />
        </motion.div>
      </motion.div>

      {/* Task Card */}
      <motion.div
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ duration: 0.2 }}
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={`flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-xl group relative ${
          isDragging ? 'shadow-lg shadow-white/5' : ''
        }`}
        onMouseEnter={() => setShowDelete(true)}
        onMouseLeave={() => setShowDelete(false)}
      >
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="touch-none p-1 text-[#555555] hover:text-[#888888] cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        {/* Task Text */}
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent border-b border-white/20 py-1 focus:outline-none focus:border-white/40 text-[#EAEAEA] font-mono text-sm"
          />
        ) : (
          <span
            onClick={() => setIsEditing(true)}
            className={`flex-1 font-mono text-sm cursor-text ${getStalenessColor(task.staleDays)}`}
          >
            {task.text}
          </span>
        )}

        {/* Delete Button (Desktop) */}
        <button
          onClick={() => onDelete(task.id)}
          className={`p-1 text-[#555555] hover:text-[#888888] transition-opacity ${
            showDelete ? 'opacity-100' : 'opacity-0'
          } md:block hidden`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Complete Checkbox */}
        <button
          onClick={() => onComplete(task.id)}
          className="p-2 border border-white/20 rounded-lg hover:bg-white/10 hover:border-white/30 transition-all"
        >
          <Check className="w-4 h-4 text-[#888888]" />
        </button>
      </motion.div>
    </div>
  )
}
```

**Step 2: Commit**

```bash
git add app/today/SortableTask.tsx
git commit -m "feat: add mobile swipe-to-delete gesture"
```

---

## Task 12: Build and Test

**Step 1: Run type check**

Run: `npm run type-check`
Expected: No TypeScript errors

**Step 2: Run build**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Run dev server and manual test**

Run: `npm run dev`

Test checklist:
- [ ] Navigate to `/today` - should redirect to login if not authenticated
- [ ] Login and navigate to `/today` - should show empty state
- [ ] Add a task - should appear in list
- [ ] Add 10 tasks - input should be disabled
- [ ] Edit a task by clicking text
- [ ] Drag to reorder tasks
- [ ] Complete a task - should animate out
- [ ] Delete a task (swipe on mobile, X on desktop)
- [ ] Check `/today/archive` shows completed tasks with stats
- [ ] Test on mobile viewport

**Step 4: Commit any fixes**

```bash
git add .
git commit -m "fix: address issues found in testing"
```

---

## Task 13: Push and Deploy

**Step 1: Push to remote**

```bash
git push origin main
```

**Step 2: Verify deployment**

Wait for Coolify to auto-deploy, then verify at https://amirhjalali.com/today

---

## Summary

Files created/modified:
- `prisma/schema.prisma` - Added DailyTask model
- `lib/db/tasks.ts` - Database helper functions
- `app/api/tasks/route.ts` - GET/POST endpoints
- `app/api/tasks/[id]/route.ts` - PATCH/DELETE endpoints
- `app/today/page.tsx` - Server component with auth
- `app/today/TodayClient.tsx` - Main client component
- `app/today/SortableTask.tsx` - Draggable task item
- `app/today/archive/page.tsx` - Archive server component
- `app/today/archive/ArchiveClient.tsx` - Archive with stats

Dependencies added:
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@dnd-kit/utilities`
