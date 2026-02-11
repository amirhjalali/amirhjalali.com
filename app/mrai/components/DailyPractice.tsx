'use client'

import { motion } from 'framer-motion'
import { useMrAIStats } from '../hooks/useMrAIState'

const ARC_BOUNDARIES = [
  { arc: 1, startDay: 1, label: 'Foundation' },
  { arc: 2, startDay: 11, label: 'Deepening' },
  { arc: 3, startDay: 20, label: 'Emergence' },
]

export default function DailyPractice() {
  const { days, tasks, arc, loading } = useMrAIStats()

  if (loading) return null

  const totalDays = days || 22
  const dotCount = Math.min(totalDays, 30) // Show last 30 days max

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass p-6 rounded-xl border border-white/10"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EAEAEA] animate-pulse" />
        <span className="text-xs font-mono text-[#888888] uppercase tracking-widest">
          Daily Practice
        </span>
      </div>

      {/* Rhythm visualization - one dot per day */}
      <div className="flex items-center gap-1 mb-4 flex-wrap">
        {Array.from({ length: dotCount }, (_, i) => {
          const dayNum = totalDays - dotCount + i + 1
          const currentArc = ARC_BOUNDARIES.filter(a => dayNum >= a.startDay).pop()
          const isToday = dayNum === totalDays
          const isArcStart = ARC_BOUNDARIES.some(a => a.startDay === dayNum)

          return (
            <div key={dayNum} className="flex items-center">
              {isArcStart && dayNum > 1 && (
                <div className="w-px h-3 bg-white/20 mx-0.5" />
              )}
              <div
                className={`rounded-full transition-all ${
                  isToday
                    ? 'w-2 h-2 bg-[#EAEAEA]'
                    : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                }`}
                title={`Day ${dayNum}${isArcStart ? ` — Arc ${currentArc?.arc}` : ''}`}
              />
            </div>
          )
        })}
      </div>

      {/* Practice stats */}
      <div className="flex items-baseline gap-6 text-sm">
        <div>
          <span className="font-mono text-[#EAEAEA]">{totalDays}</span>
          <span className="text-[#888888] ml-1 text-xs">days</span>
        </div>
        <div>
          <span className="font-mono text-[#EAEAEA]">{tasks || totalDays * 10}</span>
          <span className="text-[#888888] ml-1 text-xs">tasks</span>
        </div>
        <div>
          <span className="font-mono text-[#EAEAEA]">{arc || 3}</span>
          <span className="text-[#888888] ml-1 text-xs">
            {ARC_BOUNDARIES.find(a => a.arc === (arc || 3))?.label || `arc`}
          </span>
        </div>
        <div>
          <span className="font-mono text-[#EAEAEA]">10</span>
          <span className="text-[#888888] ml-1 text-xs">per day</span>
        </div>
      </div>
    </motion.div>
  )
}
