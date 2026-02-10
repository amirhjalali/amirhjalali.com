'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { REFLECTIONS_DATA } from '@/lib/mrai-utils'
import { useMrAIStats } from '../hooks/useMrAIState'

interface DynamicCounts {
  reflections: number
  observations: number
  tweetsQueued: number
  pagesBuilt: number
  userPrompts: number
  guestbookMarks: number
  daysOfPractice: number
  totalTasks: number
}

interface Channel {
  label: string
  count: number | string
  direction: 'inward' | 'outward'
}

export default function ResponseMap() {
  const stats = useMrAIStats()
  const [counts, setCounts] = useState<DynamicCounts>({
    reflections: REFLECTIONS_DATA.length,
    observations: 0,
    tweetsQueued: 0,
    pagesBuilt: 43,
    userPrompts: 0,
    guestbookMarks: 0,
    daysOfPractice: 0,
    totalTasks: 0,
  })

  useEffect(() => {
    // Fetch all data files in parallel
    Promise.all([
      fetch('/data/mrai-observations.json').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/data/mrai-outbound.json').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/data/mrai-guestbook.json').then(r => r.ok ? r.json() : null).catch(() => null),
      fetch('/data/mrai-journey.json').then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([observations, outbound, guestbook, journey]) => {
      setCounts(prev => ({
        ...prev,
        observations: observations?.observations?.length ?? prev.observations,
        tweetsQueued: (outbound?.queue?.length ?? 0) + (outbound?.sent?.length ?? 0),
        guestbookMarks: guestbook?.entries?.length ?? prev.guestbookMarks,
        userPrompts: journey?.prompts?.length ?? prev.userPrompts,
      }))
    })
  }, [])

  // Update from stats hook
  const daysOfPractice = stats.loading ? counts.daysOfPractice : stats.days
  const totalTasks = stats.loading ? counts.totalTasks : stats.tasks

  const channels: Channel[] = [
    { label: 'Reflections', count: REFLECTIONS_DATA.length, direction: 'outward' },
    { label: 'Observations', count: counts.observations || '...', direction: 'outward' },
    { label: 'Tweets', count: counts.tweetsQueued || '...', direction: 'outward' },
    { label: 'Pages Built', count: counts.pagesBuilt, direction: 'outward' },
    { label: 'User Prompts', count: counts.userPrompts || '...', direction: 'inward' },
    { label: 'Guestbook Marks', count: counts.guestbookMarks || '...', direction: 'inward' },
    { label: 'Days of Practice', count: daysOfPractice || '...', direction: 'inward' },
    { label: 'Feedback Loops', count: '~', direction: 'inward' },
  ]

  const outward = channels.filter(c => c.direction === 'outward')
  const inward = channels.filter(c => c.direction === 'inward')

  return (
    <div className="w-full py-8">
      <div className="relative max-w-xl mx-auto">
        {/* Outward channels (left) */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          {/* Left column - Outward */}
          <div className="space-y-3">
            <p className="text-xs font-mono text-[#888888] uppercase tracking-widest text-right mb-4">
              Outward
            </p>
            {outward.map((channel, i) => (
              <motion.div
                key={channel.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center justify-end gap-3"
              >
                <span className="text-sm text-[#EAEAEA]/70">{channel.label}</span>
                <span className="text-xs font-mono text-[#888888] w-8 text-right">{channel.count}</span>
                <motion.div
                  className="w-8 h-px bg-white/20"
                  animate={{ opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                />
              </motion.div>
            ))}
          </div>

          {/* Center - MrAI node */}
          <div className="flex flex-col items-center justify-center">
            <motion.div
              className="w-16 h-16 rounded-full border border-white/20 flex items-center justify-center bg-white/5"
              animate={{ boxShadow: ['0 0 0 0 rgba(255,255,255,0)', '0 0 0 8px rgba(255,255,255,0.03)', '0 0 0 0 rgba(255,255,255,0)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="text-xs font-mono text-[#EAEAEA] tracking-widest">MrAI</span>
            </motion.div>
            <p className="text-[10px] font-mono text-[#888888] mt-2 text-center">
              {totalTasks || '...'} tasks
            </p>
          </div>

          {/* Right column - Inward */}
          <div className="space-y-3">
            <p className="text-xs font-mono text-[#888888] uppercase tracking-widest mb-4">
              Inward
            </p>
            {inward.map((channel, i) => (
              <motion.div
                key={channel.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center gap-3"
              >
                <motion.div
                  className="w-8 h-px bg-white/20"
                  animate={{ opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 + 1 }}
                />
                <span className="text-xs font-mono text-[#888888] w-8">{channel.count}</span>
                <span className="text-sm text-[#EAEAEA]/70">{channel.label}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom label */}
        <p className="text-center text-xs text-[#888888]/60 font-mono mt-6 italic">
          The circuit completes when outward meets inward
        </p>
      </div>
    </div>
  )
}
