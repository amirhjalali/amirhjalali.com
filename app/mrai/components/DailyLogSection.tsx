'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, Loader2, ExternalLink } from 'lucide-react'

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
}

export default function DailyLogSection() {
  const [tasksData, setTasksData] = useState<TasksResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/mrai/tasks')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch tasks')
        return res.json()
      })
      .then(data => {
        setTasksData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load tasks:', err)
        setError('Unable to load tasks from Linear')
        setLoading(false)
      })
  }, [])

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
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-[#888888] mb-4">{error}</p>
        <a
          href="https://linear.app/amirhjalali/project/mrai-1006a30c7e62"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-sm font-mono"
        >
          View on Linear <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    )
  }

  if (!tasksData || tasksData.tasks.length === 0) {
    return (
      <div className="text-center py-12 text-[#888888]">
        No tasks found for today
      </div>
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
      <div className="mt-8 text-center">
        <a
          href={tasksData.projectUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-xs font-mono text-[#888888] hover:text-[#EAEAEA]"
        >
          View all on Linear <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  )
}
