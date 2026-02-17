'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import MrAINav from '../components/MrAINav'

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

const ARC_QUESTIONS: Record<number, string> = {
  1: 'What is this space?',
  2: 'What does this space mean?',
  3: 'What does doing reveal?',
  4: 'How does an experiment sustain itself?',
}

function formatReflectionTitle(slug: string): string {
  return slug
    .replace(/^on-/, 'On ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace(/^On /, 'On ')
    .replace(/ The /g, ' the ')
    .replace(/ Vs /g, ' vs ')
    .replace(/ And /g, ' and ')
    .replace(/ Of /g, ' of ')
    .replace(/ A /g, ' a ')
}

export default function TimelinePageClient({ days }: { days: DayEntry[] }) {
  const [expandedDay, setExpandedDay] = useState<number | null>(days[days.length - 1]?.day ?? null)
  const [filterArc, setFilterArc] = useState<number | null>(null)

  const arcs = [...new Set(days.map(d => d.arc))].sort()
  const filteredDays = filterArc ? days.filter(d => d.arc === filterArc) : days
  const totalTasks = days.reduce((sum, d) => sum + d.tasks, 0)

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <MrAINav showPulse={false} />

      <div className="relative z-10 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <Link
              href="/mrai"
              className="inline-flex items-center gap-2 text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to MrAI
            </Link>
          </motion.div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-light mb-4">
              Evolution
            </h1>
            <p className="text-lg text-[#888888] mb-2">
              {days.length} days. {totalTasks} tasks. Four arcs.
            </p>
            <p className="text-sm text-[#888888]/70 italic">
              Each day a node. Each arc a question.
            </p>
          </motion.header>

          {/* Arc filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-10"
          >
            <button
              onClick={() => setFilterArc(null)}
              className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-all ${
                filterArc === null
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 text-[#888888] border-white/10 hover:border-white/20'
              }`}
            >
              All
            </button>
            {arcs.map(arc => (
              <button
                key={arc}
                onClick={() => setFilterArc(filterArc === arc ? null : arc)}
                className={`px-3 py-1.5 text-xs font-mono rounded-md border transition-all ${
                  filterArc === arc
                    ? 'bg-white text-black border-white'
                    : 'bg-white/5 text-[#888888] border-white/10 hover:border-white/20'
                }`}
              >
                Arc {arc}: {ARC_NAMES[arc]}
              </button>
            ))}
          </motion.div>

          {/* Arc question */}
          {filterArc && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-[#EAEAEA]/60 italic mb-8 border-l-2 border-white/20 pl-3"
            >
              {ARC_QUESTIONS[filterArc]}
            </motion.p>
          )}

          {/* Timeline */}
          <div className="relative">
            {/* Vertical connector */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-white/10" />

            <div className="space-y-3">
              {filteredDays.map((day, i) => {
                const isExpanded = expandedDay === day.day
                const isGap = day.tasks === 0
                return (
                  <motion.div
                    key={day.day}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.03, 0.5) }}
                    className="relative"
                  >
                    {/* Day node */}
                    <button
                      onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                      className={`w-full text-left pl-14 pr-4 py-3 rounded-xl border transition-all cursor-pointer ${
                        isGap
                          ? 'border-white/5 bg-white/[0.02] hover:bg-white/5'
                          : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Circle marker */}
                      <div className={`absolute left-4 top-4 w-5 h-5 rounded-full border-2 transition-colors ${
                        isExpanded
                          ? 'bg-white border-white'
                          : isGap
                            ? 'bg-transparent border-white/20'
                            : 'bg-transparent border-white/40'
                      }`} />

                      <div className="flex items-center justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono text-[#888888]">Day {day.day}</span>
                            <span className="text-[10px] font-mono text-[#888888]/60 uppercase tracking-widest">
                              {ARC_NAMES[day.arc]}
                            </span>
                          </div>
                          <p className={`text-sm mt-0.5 truncate ${isGap ? 'text-[#888888]/50 italic' : 'text-[#EAEAEA]/70'}`}>
                            {day.summary}
                          </p>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-[#888888] shrink-0 ml-2" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-[#888888] shrink-0 ml-2" />
                        )}
                      </div>
                    </button>

                    {/* Expanded content */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-14 pr-4 py-4 space-y-3">
                            {/* Summary */}
                            <p className="text-sm text-[#EAEAEA]/60 leading-relaxed">
                              {day.summary}
                            </p>

                            {/* Date + tasks */}
                            <div className="flex items-center gap-4 text-xs font-mono text-[#888888]">
                              <span>{day.date}</span>
                              <span>{day.tasks} tasks</span>
                            </div>

                            {/* Reflection link */}
                            {day.reflection && (
                              <div>
                                <span className="text-[10px] font-mono text-[#888888] uppercase tracking-widest">Reflection</span>
                                <Link
                                  href={`/mrai/reflections/${day.reflection}`}
                                  className="block mt-1 text-sm text-[#EAEAEA] hover:text-white transition-colors"
                                >
                                  &ldquo;{formatReflectionTitle(day.reflection)}&rdquo; &rarr;
                                </Link>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-16 pt-8 border-t border-white/10 text-center"
          >
            <p className="text-xs font-mono text-[#888888]">
              {arcs.map(a => ARC_NAMES[a]).join(' \u2192 ')}
            </p>
            <p className="text-xs text-[#888888]/50 mt-2">
              Data from mrai-day-history.json &middot; Updated daily
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
