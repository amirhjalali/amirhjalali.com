'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown, ChevronUp, FileText, CheckCircle } from 'lucide-react'
import { REFLECTIONS_DATA } from '@/lib/mrai-utils'

interface DayData {
  day: number
  date: string
  theme: string
  tasksCompleted: number
  highlights: string[]
  reflection?: {
    slug: string
    title: string
  }
  isGap?: boolean
}

function buildDailyData(): DayData[] {
  // Build day data from reflections (each day has a reflection)
  const days: DayData[] = []

  // Map reflections to days
  const reflectionsByDay = new Map<number, typeof REFLECTIONS_DATA[0]>()
  for (const r of REFLECTIONS_DATA) {
    reflectionsByDay.set(r.dayNumber, r)
  }

  // Get the highest day number
  const maxDay = Math.max(...REFLECTIONS_DATA.map(r => r.dayNumber))

  // Build recent days (show last 8)
  for (let d = maxDay; d >= Math.max(1, maxDay - 7); d--) {
    const reflection = reflectionsByDay.get(d)

    // Day 27 is the gap
    if (d === 27) {
      days.push({
        day: 27,
        date: 'February 9, 2026',
        theme: 'The Gap',
        tasksCompleted: 0,
        highlights: ['Day 27 never ran — a missing comma in settings.json broke the chain'],
        isGap: true,
      })
      continue
    }

    if (reflection) {
      days.push({
        day: d,
        date: reflection.date,
        theme: reflection.title.replace('On ', ''),
        tasksCompleted: 10,
        highlights: reflection.themes.map(t =>
          t.charAt(0).toUpperCase() + t.slice(1)
        ),
        reflection: {
          slug: reflection.id,
          title: reflection.title,
        },
      })
    }
  }

  return days
}

interface DaySummaryProps {
  day: DayData
  isExpanded: boolean
  onToggle: () => void
}

function DaySummaryCard({ day, isExpanded, onToggle }: DaySummaryProps) {
  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      day.isGap
        ? 'border-white/5 bg-transparent'
        : 'border-white/10 bg-white/[0.02]'
    }`}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono ${
            day.isGap
              ? 'border border-white/10 text-[#666666]'
              : 'bg-white/10 text-[#888888]'
          }`}>
            {day.day}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={`font-serif ${day.isGap ? 'text-[#888888]/50 italic' : 'text-[#EAEAEA]'}`}>
                {day.theme}
              </span>
            </div>
            <span className="text-xs text-[#666666] font-mono">{day.date}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#666666]">
            {day.isGap ? 'absent' : `${day.tasksCompleted}/10`}
          </span>
          {!day.isGap && (isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#888888]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#888888]" />
          ))}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && !day.isGap && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-white/10">
              <div className="mb-4">
                <h4 className="text-xs font-mono text-[#666666] uppercase tracking-widest mb-2">
                  Themes
                </h4>
                <ul className="space-y-1.5">
                  {day.highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-[#888888]">
                      <CheckCircle className="w-3 h-3 mt-1 flex-shrink-0 text-[#666666]" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {day.reflection && (
                <div className="flex items-center gap-4 pt-2">
                  <Link
                    href={`/mrai/reflections/${day.reflection.slug}`}
                    className="flex items-center gap-1.5 text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    {day.reflection.title}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DailySummary() {
  const [dailyData, setDailyData] = useState<DayData[]>([])
  const [expandedDay, setExpandedDay] = useState<number>(0)

  useEffect(() => {
    const data = buildDailyData()
    setDailyData(data)
    if (data.length > 0) {
      setExpandedDay(data[0].day)
    }
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-mono text-[#888888] uppercase tracking-widest">
          Recent Days
        </h3>
        <Link
          href="/mrai/evolution"
          className="text-xs font-mono text-[#666666] hover:text-[#EAEAEA] transition-colors"
        >
          Full evolution &rarr;
        </Link>
      </div>

      {dailyData.map((day) => (
        <DaySummaryCard
          key={day.day}
          day={day}
          isExpanded={expandedDay === day.day}
          onToggle={() => setExpandedDay(expandedDay === day.day ? 0 : day.day)}
        />
      ))}
    </div>
  )
}
