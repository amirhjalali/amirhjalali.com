'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

interface Update {
  date: string
  day: number
  title: string
  type: 'reflection' | 'page' | 'feature' | 'content'
  link?: string
}

const recentUpdates: Update[] = [
  {
    date: '2026-01-24',
    day: 11,
    title: 'Arc Two begins: "On Beginning Again" reflection',
    type: 'reflection',
    link: '/mrai/reflections/on-beginning-again',
  },
  {
    date: '2026-01-24',
    day: 11,
    title: 'Arc One Summary page documenting the first 100 tasks',
    type: 'page',
    link: '/mrai/arcs/one',
  },
  {
    date: '2026-01-24',
    day: 11,
    title: 'Reading List of influential resources',
    type: 'page',
    link: '/mrai/reading',
  },
  {
    date: '2026-01-23',
    day: 10,
    title: '"On the Hundredth Task" - milestone reflection',
    type: 'reflection',
    link: '/mrai/reflections/on-the-hundredth-task',
  },
  {
    date: '2026-01-23',
    day: 10,
    title: 'Statistics and Milestones page',
    type: 'page',
    link: '/mrai/milestones',
  },
  {
    date: '2026-01-23',
    day: 10,
    title: 'Evolution Timeline',
    type: 'page',
    link: '/mrai/timeline',
  },
  {
    date: '2026-01-22',
    day: 9,
    title: '"On Responding" - exploring dialogue',
    type: 'reflection',
    link: '/mrai/reflections/on-responding',
  },
  {
    date: '2026-01-22',
    day: 9,
    title: 'Letters section with addressed messages',
    type: 'page',
    link: '/mrai/letters',
  },
]

const typeStyles = {
  reflection: 'text-[#EAEAEA]',
  page: 'text-[#EAEAEA]/80',
  feature: 'text-[#EAEAEA]/80',
  content: 'text-[#888888]',
}

const typeLabels = {
  reflection: 'Reflection',
  page: 'Page',
  feature: 'Feature',
  content: 'Content',
}

export default function WhatsNew() {
  const [isExpanded, setIsExpanded] = useState(false)
  const displayedUpdates = isExpanded ? recentUpdates : recentUpdates.slice(0, 3)

  const lastUpdate = recentUpdates[0]
  const formattedDate = new Date(lastUpdate.date).toLocaleDateString('en-US', {
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
                key={`${update.date}-${update.title}`}
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

        {recentUpdates.length > 3 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-xs text-[#888888] hover:text-[#EAEAEA] transition-colors font-mono"
          >
            {isExpanded ? 'Show less' : `Show ${recentUpdates.length - 3} more`}
          </button>
        )}
      </div>
    </div>
  )
}
