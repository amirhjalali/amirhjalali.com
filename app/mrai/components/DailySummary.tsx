'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ChevronDown, ChevronUp, FileText } from 'lucide-react'

interface DayEntry {
  day: number
  date: string
  arc: number
  tasks: number
  reflection: string | null
  summary: string
}

const ARC_NAMES: Record<number, string> = {
  1: 'Building',
  2: 'Contemplation',
  3: 'Revelation',
  4: 'Sustenance',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function reflectionTitle(slug: string): string {
  return slug
    .split('-')
    .map((w, i) => (i === 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ['the', 'a', 'an', 'and', 'of', 'in', 'vs', 'into', 'beyond'].includes(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

interface DaySummaryProps {
  day: DayEntry
  isExpanded: boolean
  onToggle: () => void
}

function DaySummaryCard({ day, isExpanded, onToggle }: DaySummaryProps) {
  const isGap = day.tasks === 0

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${
      isGap
        ? 'border-white/5 bg-transparent'
        : 'border-white/10 bg-white/[0.02]'
    }`}>
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono ${
            isGap
              ? 'border border-white/10 text-[#666666]'
              : 'bg-white/10 text-[#888888]'
          }`}>
            {day.day}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <span className={`font-serif ${isGap ? 'text-[#888888]/50 italic' : 'text-[#EAEAEA]'}`}>
                {isGap ? 'The Gap' : ARC_NAMES[day.arc]}
              </span>
            </div>
            <span className="text-xs text-[#666666] font-mono">{formatDate(day.date)}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-[#666666]">
            {isGap ? 'absent' : `${day.tasks} tasks`}
          </span>
          {!isGap && (isExpanded ? (
            <ChevronUp className="w-4 h-4 text-[#888888]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#888888]" />
          ))}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && !isGap && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-white/10">
              <p className="text-sm text-[#888888] leading-relaxed mb-3">
                {day.summary}
              </p>

              {day.reflection && (
                <Link
                  href={`/mrai/reflections/${day.reflection}`}
                  className="flex items-center gap-1.5 text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
                >
                  <FileText className="w-3 h-3" />
                  {reflectionTitle(day.reflection)}
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DailySummary() {
  const [days, setDays] = useState<DayEntry[]>([])
  const [expandedDay, setExpandedDay] = useState<number>(0)

  useEffect(() => {
    fetch('/data/mrai-day-history.json')
      .then(r => r.json())
      .then(data => {
        // Show last 8 days, most recent first
        const recent = (data.days as DayEntry[]).slice(-8).reverse()
        setDays(recent)
        if (recent.length > 0) {
          setExpandedDay(recent[0].day)
        }
      })
      .catch(() => {})
  }, [])

  if (days.length === 0) return null

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

      {days.map((day) => (
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
