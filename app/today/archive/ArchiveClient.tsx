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

type GroupedTasks = {
  label: string
  date: Date
  tasks: CompletedTask[]
}

function groupTasksByDate(tasks: CompletedTask[]): GroupedTasks[] {
  const groups: Map<string, { date: Date; tasks: CompletedTask[] }> = new Map()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  for (const task of tasks) {
    const date = new Date(task.completedAt)
    date.setHours(0, 0, 0, 0)
    const dateKey = date.toISOString()

    let label: string
    if (date.getTime() === today.getTime()) {
      label = 'Today'
    } else if (date.getTime() === yesterday.getTime()) {
      label = 'Yesterday'
    } else {
      label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }

    if (!groups.has(dateKey)) {
      groups.set(dateKey, { date, tasks: [] })
    }
    groups.get(dateKey)!.tasks.push(task)
  }

  // Sort by date descending (most recent first)
  return Array.from(groups.entries())
    .sort(([, a], [, b]) => b.date.getTime() - a.date.getTime())
    .map(([, group]) => {
      const label = group.date.getTime() === today.getTime()
        ? 'Today'
        : group.date.getTime() === yesterday.getTime()
        ? 'Yesterday'
        : group.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      return { label, date: group.date, tasks: group.tasks }
    })
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

              {groupedTasks.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-[#888888] font-mono text-sm">No completed tasks yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {groupedTasks.map((group) => (
                    <div key={group.label}>
                      <h2 className="text-[#888888] font-mono text-xs uppercase tracking-widest mb-3 border-b border-white/10 pb-2">
                        {group.label}
                      </h2>
                      <ul className="space-y-2">
                        {group.tasks.map((task) => (
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
