'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, Circle, Loader2, ExternalLink, RefreshCw, AlertCircle, Inbox } from 'lucide-react'

interface Task {
  id: string
  identifier: string
  title: string
  status: string
  url: string
  createdAt: string
}

interface TasksResponse {
  tasks: Task[]
  day: number
  date: string
  projectUrl: string
  source?: 'linear' | 'mock'
}

function SkeletonTask({ index }: { index: number }) {
  return (
    <div
      className="flex items-center gap-4 p-4 rounded-lg border border-white/10 animate-pulse"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="w-5 h-5 rounded-full bg-white/10" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-white/10 rounded w-3/4" />
      </div>
      <div className="h-3 bg-white/10 rounded w-16" />
    </div>
  )
}

function SkeletonLoading() {
  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="h-3 bg-white/10 rounded w-32 animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="h-1 w-32 bg-white/10 rounded-full" />
          <div className="h-3 bg-white/10 rounded w-10 animate-pulse" />
        </div>
      </div>
      <div className="space-y-3">
        {[0, 1, 2, 3, 4].map(i => (
          <SkeletonTask key={i} index={i} />
        ))}
      </div>
    </div>
  )
}

export default function DailyLogSection() {
  const [tasksData, setTasksData] = useState<TasksResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retrying, setRetrying] = useState(false)

  const fetchTasks = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/mrai/tasks')
      if (!res.ok) throw new Error('Failed to fetch tasks')
      const data = await res.json()
      setTasksData(data)
    } catch (err) {
      console.error('Failed to load tasks:', err)
      setError('Unable to load tasks from Linear')
    } finally {
      setLoading(false)
      setRetrying(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleRetry = () => {
    setRetrying(true)
    fetchTasks()
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-[#EAEAEA]" />
      case 'in progress':
        return <Loader2 className="w-5 h-5 text-[#EAEAEA] animate-spin" />
      default:
        return <Circle className="w-5 h-5 text-[#888888]" />
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'done':
      case 'completed':
        return 'border-white/20 bg-white/10'
      case 'in progress':
        return 'border-white/20 bg-white/5'
      default:
        return 'border-white/10'
    }
  }

  if (loading) {
    return <SkeletonLoading />
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4">
          <AlertCircle className="w-6 h-6 text-[#888888]" />
        </div>
        <p className="text-[#888888] mb-2">{error}</p>
        <p className="text-xs text-[#666666] mb-6 max-w-xs mx-auto">
          This could be a temporary connection issue or the LINEAR_API_KEY may not be configured.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleRetry}
            disabled={retrying}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors text-sm font-mono disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${retrying ? 'animate-spin' : ''}`} />
            {retrying ? 'Retrying...' : 'Try Again'}
          </button>
          <a
            href="https://linear.app/amirhjalali/project/mrai-1006a30c7e62"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm font-mono"
          >
            View on Linear <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    )
  }

  if (!tasksData || tasksData.tasks.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-12"
      >
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4">
          <Inbox className="w-6 h-6 text-[#888888]" />
        </div>
        <p className="text-[#EAEAEA] mb-2">No tasks yet today</p>
        <p className="text-xs text-[#666666] max-w-xs mx-auto">
          Tasks appear here when the daily ritual begins. Check back soon.
        </p>
      </motion.div>
    )
  }

  const completedCount = tasksData.tasks.filter(t =>
    t.status.toLowerCase() === 'done' || t.status.toLowerCase() === 'completed'
  ).length

  return (
    <div>
      {/* Progress header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
            Day {tasksData.day} &bull; {tasksData.date}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-500"
              style={{ width: `${(completedCount / tasksData.tasks.length) * 100}%` }}
            />
          </div>
          <span className="text-xs font-mono text-[#888888]">
            {completedCount}/{tasksData.tasks.length}
          </span>
        </div>
      </div>

      {/* Task list */}
      <div className="space-y-3">
        {tasksData.tasks.map((task, index) => (
          <motion.a
            key={task.id}
            href={task.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-4 p-4 rounded-lg border ${getStatusStyle(task.status)} hover:bg-white/5 transition-all group`}
          >
            {getStatusIcon(task.status)}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-light truncate ${
                task.status.toLowerCase() === 'done' ? 'text-[#888888] line-through' : 'text-[#EAEAEA]'
              }`}>
                {task.title}
              </p>
            </div>
            <span className="text-xs font-mono text-[#888888] group-hover:text-[#EAEAEA] transition-colors">
              {task.identifier}
            </span>
          </motion.a>
        ))}
      </div>

      {/* View all link */}
      <div className="mt-8 text-center space-y-3">
        <a
          href={tasksData.projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-xs font-mono text-[#888888] hover:text-[#EAEAEA]"
        >
          View all on Linear <ExternalLink className="w-3 h-3" />
        </a>
        {tasksData.source === 'mock' && (
          <p className="text-xs text-[#666666] font-mono">
            Showing cached data &bull; Live sync unavailable
          </p>
        )}
      </div>
    </div>
  )
}
