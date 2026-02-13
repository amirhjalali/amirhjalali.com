'use client'

import { motion } from 'framer-motion'
import { useMrAIStats } from '../hooks/useMrAIState'

const ARCS = [
  { number: 1, name: 'Building', startDay: 1, endDay: 10 },
  { number: 2, name: 'Contemplation', startDay: 11, endDay: 19 },
  { number: 3, name: 'Revelation', startDay: 20, endDay: 25 },
  { number: 4, name: 'Sustenance', startDay: 26, endDay: 999 },
]

const GAP_DAY = 27

const ARC_OPACITY: Record<number, string> = {
  1: 'bg-white/10',
  2: 'bg-white/15',
  3: 'bg-white/20',
  4: 'bg-white/30',
}

export default function TimelineVis() {
  const { days, loading } = useMrAIStats()

  if (loading) return null

  const totalDays = days || 31

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass p-6 rounded-xl border border-white/10"
    >
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EAEAEA] animate-pulse" />
        <span className="text-xs font-mono text-[#888888] uppercase tracking-widest">
          Timeline
        </span>
        <span className="ml-auto text-xs font-mono text-[#888888]">
          {totalDays} days
        </span>
      </div>

      {/* Day grid */}
      <div className="flex flex-wrap gap-1.5">
        {Array.from({ length: totalDays }, (_, i) => {
          const day = i + 1
          const arc = ARCS.find(a => day >= a.startDay && day <= a.endDay)
          const isGap = day === GAP_DAY
          const isToday = day === totalDays

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              className="group relative"
            >
              <div
                className={`
                  w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-mono
                  transition-all cursor-default
                  ${isGap
                    ? 'border border-dashed border-white/20 text-[#888888]'
                    : isToday
                      ? 'bg-white text-black font-bold'
                      : `${ARC_OPACITY[arc?.number ?? 4]} text-[#EAEAEA]/70 hover:text-[#EAEAEA]`
                  }
                `}
              >
                {day}
              </div>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#111] border border-white/10 rounded text-[10px] font-mono text-[#888888] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                Day {day} {arc && `· ${arc.name}`}
                {isGap && ' · Gap'}
                {isToday && ' · Today'}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Arc legend */}
      <div className="flex flex-wrap items-center gap-4 mt-4 text-xs font-mono text-[#888888]">
        {ARCS.filter(a => a.startDay <= totalDays).map(arc => (
          <div key={arc.number} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${ARC_OPACITY[arc.number]}`} />
            <span>{arc.name}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm border border-dashed border-white/20" />
          <span>Gap</span>
        </div>
      </div>
    </motion.div>
  )
}
