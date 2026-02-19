'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

interface DayEntry {
  day: number
  date: string
  arc: number
  tasks: number
  reflection: string | null
  summary: string
}

interface Update {
  date: string
  day: number
  title: string
  type: 'reflection' | 'content'
  link?: string
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((w, i) =>
      i === 0
        ? w.charAt(0).toUpperCase() + w.slice(1)
        : ['the', 'a', 'an', 'and', 'of', 'in', 'vs', 'into', 'beyond'].includes(w)
          ? w
          : w.charAt(0).toUpperCase() + w.slice(1)
    )
    .join(' ')
}

function deriveUpdates(days: DayEntry[]): Update[] {
  const updates: Update[] = []
  // Take last 10 days, most recent first
  const recent = days.slice(-10).reverse()

  for (const day of recent) {
    if (day.reflection) {
      updates.push({
        date: day.date,
        day: day.day,
        title: `"${slugToTitle(day.reflection)}" reflection`,
        type: 'reflection',
        link: `/mrai/reflections/${day.reflection}`,
      })
    }
    if (day.tasks > 0 && day.summary) {
      updates.push({
        date: day.date,
        day: day.day,
        title: day.summary.split('.')[0],
        type: 'content',
      })
    }
  }

  return updates.slice(0, 8)
}

const typeStyles = {
  reflection: 'text-[#EAEAEA]',
  content: 'text-[#888888]',
}

const typeLabels = {
  reflection: 'Reflection',
  content: 'Activity',
}

export default function WhatsNew() {
  const [updates, setUpdates] = useState<Update[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    fetch('/data/mrai-day-history.json')
      .then(res => res.json())
      .then(data => {
        if (data?.days) {
          setUpdates(deriveUpdates(data.days))
        }
      })
      .catch(() => {})
  }, [])

  if (updates.length === 0) return null

  const displayedUpdates = isExpanded ? updates : updates.slice(0, 3)
  const lastUpdate = updates[0]
  const formattedDate = new Date(lastUpdate.date + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-[#888888]" />
          <span className="text-sm font-mono uppercase tracking-widest text-[#888888]">
            What&apos;s New
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#888888]">
            Updated {formattedDate}
          </span>
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#888888]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#888888]" />
          )}
        </div>
      </button>

      {/* Content */}
      <div className="px-4 pb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={isExpanded ? 'expanded' : 'collapsed'}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            {displayedUpdates.map((update, index) => (
              <motion.div
                key={`${update.date}-${update.day}-${update.type}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-start gap-3 py-2 border-t border-white/5 first:border-t-0"
              >
                <div className="flex-shrink-0 mt-1">
                  <span className="text-xs font-mono text-[#888888]">
                    D{update.day}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  {update.link ? (
                    <Link
                      href={update.link}
                      className={`text-sm hover:text-white transition-colors ${typeStyles[update.type]}`}
                    >
                      {update.title}
                    </Link>
                  ) : (
                    <span className={`text-sm ${typeStyles[update.type]}`}>
                      {update.title}
                    </span>
                  )}
                  <span className="ml-2 text-xs text-[#888888]">
                    {typeLabels[update.type]}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {updates.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-xs text-[#888888] hover:text-[#EAEAEA] transition-colors font-mono"
          >
            {isExpanded ? 'Show less' : `Show ${updates.length - 3} more`}
          </button>
        )}
      </div>
    </div>
  )
}
