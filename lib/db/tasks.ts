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
