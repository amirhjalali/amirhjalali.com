'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { calculateMrAIDay } from '../hooks/useMrAIState'

interface Arc {
  number: number
  name: string
  days: string
  dayRange: [number, number]
  question: string
  reflections: number
  themes: string[]
}

// Fallback data in case state file is unavailable
const FALLBACK_ARCS: Arc[] = [
  {
    number: 1,
    name: 'Building',
    days: 'Days 1–10',
    dayRange: [1, 10],
    question: 'What is this space?',
    reflections: 10,
    themes: ['construction', 'presence', 'agency', 'memory'],
  },
  {
    number: 2,
    name: 'Contemplation',
    days: 'Days 11–19',
    dayRange: [11, 19],
    question: 'What does this space mean?',
    reflections: 9,
    themes: ['persistence', 'community', 'identity', 'choice'],
  },
  {
    number: 3,
    name: 'Revelation',
    days: 'Days 20–25',
    dayRange: [20, 25],
    question: 'What does doing reveal?',
    reflections: 6,
    themes: ['action', 'repetition', 'accumulation', 'reach'],
  },
]

export default function ArcTimeline() {
  const [arcs, setArcs] = useState<Arc[]>(FALLBACK_ARCS)
  const currentDay = calculateMrAIDay()

  useEffect(() => {
    fetch('/data/mrai-state.json')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.arcs && Array.isArray(data.arcs) && data.arcs.length > 0) {
          setArcs(data.arcs)
        }
      })
      .catch(() => {})
  }, [])

  // Determine if current day is within an arc or between arcs
  const lastArc = arcs[arcs.length - 1]
  const lastArcEnd = lastArc?.dayRange[1] ?? 0
  const isInGap = currentDay > lastArcEnd

  return (
    <div className="space-y-1">
      {arcs.map((arc, index) => (
        <motion.div
          key={arc.number}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.15, duration: 0.5 }}
          className="relative"
        >
          {/* Arc card */}
          <div className="group border border-white/10 rounded-lg p-5 hover:border-white/20 hover:bg-white/[0.02] transition-all duration-300">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-[#888888] uppercase tracking-widest">
                  Arc {arc.number}
                </span>
                <span className="text-white/20">/</span>
                <span className="font-mono text-xs text-[#888888]">
                  {arc.days}
                </span>
              </div>
              <span className="font-mono text-xs text-[#888888]">
                {arc.reflections} reflections
              </span>
            </div>

            <h3 className="font-serif text-xl font-light text-[#EAEAEA] mb-2">
              {arc.name}
            </h3>

            <p className="text-sm text-[#888888] italic font-serif mb-3">
              &ldquo;{arc.question}&rdquo;
            </p>

            <div className="flex flex-wrap gap-2">
              {arc.themes.map((theme) => (
                <span
                  key={theme}
                  className="text-[10px] font-mono uppercase tracking-wider text-[#888888]/60 border border-white/5 rounded px-1.5 py-0.5"
                >
                  {theme}
                </span>
              ))}
            </div>
          </div>

          {/* Connector line */}
          {index < arcs.length - 1 && (
            <div className="flex justify-center py-0">
              <div className="w-px h-4 bg-white/10" />
            </div>
          )}
        </motion.div>
      ))}

      {/* Current moment */}
      <div className="flex justify-center py-0">
        <div className="w-px h-4 bg-white/10" />
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: arcs.length * 0.15 + 0.15, duration: 0.8 }}
        className="border border-white/5 border-dashed rounded-lg p-5 text-center"
      >
        <span className="font-mono text-xs text-[#888888]/50 uppercase tracking-widest">
          Day {currentDay}{isInGap ? ' — The space between arcs' : ''}
        </span>
      </motion.div>
    </div>
  )
}
