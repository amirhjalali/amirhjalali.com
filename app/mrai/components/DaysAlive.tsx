'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface DayEntry {
  day: number
  date: string
  arc: number
  tasks: number
  reflection: string | null
  summary: string
}

interface DayHistory {
  meta: { totalDays: number }
  days: DayEntry[]
}

const ARC_NAMES: Record<number, string> = {
  1: 'Building',
  2: 'Contemplation',
  3: 'Revelation',
  4: 'Sustenance',
}

const ARC_OPACITY: Record<number, string> = {
  1: 'bg-white/10',
  2: 'bg-white/15',
  3: 'bg-white/20',
  4: 'bg-white/30',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DaysAlive() {
  const [data, setData] = useState<DayHistory | null>(null)
  const [hoveredDay, setHoveredDay] = useState<DayEntry | null>(null)

  useEffect(() => {
    fetch('/data/mrai-day-history.json')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) return null

  const { days } = data
  const totalDays = days.length > 0 ? days[days.length - 1].day : 0

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
          Days Alive
        </span>
        <span className="ml-auto text-xs font-mono text-[#888888]">
          {totalDays} days
        </span>
      </div>

      {/* Day grid */}
      <div className="flex flex-wrap gap-1.5">
        {days.map((entry, i) => {
          const isGap = entry.tasks === 0
          const isLatest = entry.day === totalDays

          return (
            <motion.div
              key={entry.day}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.015 }}
              className="relative"
              onMouseEnter={() => setHoveredDay(entry)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              {entry.reflection ? (
                <Link href={`/mrai/reflections/${entry.reflection}`}>
                  <DayCell entry={entry} isGap={isGap} isLatest={isLatest} />
                </Link>
              ) : (
                <DayCell entry={entry} isGap={isGap} isLatest={isLatest} />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Hover detail panel */}
      <div className="mt-4 min-h-[3.5rem] border-t border-white/10 pt-3">
        {hoveredDay ? (
          <motion.div
            key={hoveredDay.day}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#EAEAEA]">
                Day {hoveredDay.day}
              </span>
              <span className="text-xs font-mono text-[#888888]">
                {formatDate(hoveredDay.date)}
              </span>
              <span className="text-xs font-mono text-[#888888]">
                · {ARC_NAMES[hoveredDay.arc]}
              </span>
              <span className="text-xs font-mono text-[#888888]">
                · {hoveredDay.tasks} tasks
              </span>
            </div>
            <p className="text-xs text-[#888888] leading-relaxed">
              {hoveredDay.summary}
            </p>
          </motion.div>
        ) : (
          <p className="text-xs text-[#666666] italic">
            Hover over a day to see its story
          </p>
        )}
      </div>

      {/* Arc legend */}
      <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-mono text-[#888888]">
        {Object.entries(ARC_NAMES).map(([num, name]) => (
          <div key={num} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded-sm ${ARC_OPACITY[Number(num)]}`} />
            <span>{name}</span>
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

function DayCell({ entry, isGap, isLatest }: { entry: DayEntry; isGap: boolean; isLatest: boolean }) {
  return (
    <div
      className={`
        w-7 h-7 rounded-sm flex items-center justify-center text-[10px] font-mono
        transition-all cursor-pointer
        ${isGap
          ? 'border border-dashed border-white/20 text-[#888888]'
          : isLatest
            ? 'bg-white text-black font-bold'
            : `${ARC_OPACITY[entry.arc]} text-[#EAEAEA]/70 hover:text-[#EAEAEA] hover:ring-1 hover:ring-white/20`
        }
      `}
    >
      {entry.day}
    </div>
  )
}
