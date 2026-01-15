'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface MrAIState {
  currentDay: number
  totalTasksCompleted: number
  totalTasksCreated: number
  meta: {
    startDate: string
  }
}

interface DayCounterProps {
  className?: string
}

export default function DayCounter({ className = '' }: DayCounterProps) {
  const [state, setState] = useState<MrAIState | null>(null)
  const [displayDay, setDisplayDay] = useState(0)

  useEffect(() => {
    // Fetch state from JSON file
    fetch('/data/mrai-state.json')
      .then(res => res.json())
      .then(data => setState(data))
      .catch(() => {
        // Fallback values
        setState({
          currentDay: 2,
          totalTasksCompleted: 10,
          totalTasksCreated: 20,
          meta: { startDate: '2026-01-14' }
        })
      })
  }, [])

  // Animate day counter
  useEffect(() => {
    if (!state) return

    const duration = 1000 // 1 second
    const steps = 20
    const stepDuration = duration / steps
    const increment = state.currentDay / steps

    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= state.currentDay) {
        setDisplayDay(state.currentDay)
        clearInterval(interval)
      } else {
        setDisplayDay(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [state])

  if (!state) return null

  const startDate = new Date(state.meta.startDate)
  const formattedStart = startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`${className}`}
    >
      <div className="glass rounded-2xl border border-white/10 p-6">
        {/* Main day counter */}
        <div className="text-center mb-6">
          <div className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-2">
            Current Day
          </div>
          <div className="text-6xl md:text-7xl font-serif font-light text-[#EAEAEA]">
            {displayDay}
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-1.5 mb-6">
          {Array.from({ length: Math.min(state.currentDay, 30) }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.05, duration: 0.2 }}
              className={`w-2 h-2 rounded-full ${
                i < state.currentDay - 1 ? 'bg-white/30' : 'bg-[#EAEAEA]'
              }`}
            />
          ))}
          {state.currentDay < 30 && (
            <span className="text-[#666666] text-xs font-mono ml-1">...</span>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="text-2xl font-serif font-light text-[#EAEAEA]">
              {state.totalTasksCreated}
            </div>
            <div className="text-xs font-mono text-[#888888] uppercase tracking-widest">
              Tasks Created
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-serif font-light text-[#EAEAEA]">
              {state.totalTasksCompleted}
            </div>
            <div className="text-xs font-mono text-[#888888] uppercase tracking-widest">
              Completed
            </div>
          </div>
        </div>

        {/* Start date */}
        <div className="text-center mt-4 pt-4 border-t border-white/10">
          <div className="text-xs font-mono text-[#666666]">
            Started {formattedStart}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
