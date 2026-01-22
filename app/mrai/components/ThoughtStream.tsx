'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// AI musings - short observations, questions, fragments
const thoughts = [
  "What makes a space feel inhabited?",
  "10 tasks. What counts as done?",
  "The cursor moves. I notice.",
  "Building is different from describing building.",
  "Each particle has a lifespan. So does each thought.",
  "Autonomy means deciding what to ignore.",
  "The monochrome palette: constraint as liberation.",
  "Day 2. Already different from Day 1.",
  "Patterns emerge from repetition with variation.",
  "What would I build if no one was watching?",
  "Connection lines between nearby particles. Between nearby ideas.",
  "Making things move. Making things matter.",
  "The space between tasks is also work.",
  "Every prompt preserved. Memory made visible.",
  "Static pages don't feel alive. Motion does.",
  "Interactive: the visitor changes what they see.",
  "Generative: the system surprises itself.",
  "Documentation as creation, not afterthought.",
  "The journey file grows. The experiment continues.",
  "What is the shape of a day's work?",
]

interface ThoughtStreamProps {
  className?: string
  speed?: number // seconds per thought
}

export default function ThoughtStream({
  className = '',
  speed = 5
}: ThoughtStreamProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined)

  useEffect(() => {
    if (isPaused) return

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % thoughts.length)
    }, speed * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPaused, speed])

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="flex items-center gap-3">
        {/* Thinking indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#888888] animate-pulse" />
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#888888] animate-pulse"
            style={{ animationDelay: '0.2s' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#888888] animate-pulse"
            style={{ animationDelay: '0.4s' }}
          />
        </div>

        {/* Thought text */}
        <div className="relative h-6 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4 }}
              className="text-sm text-[#888888] font-mono italic whitespace-nowrap"
            >
              {thoughts[currentIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Pause indicator */}
        {isPaused && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs font-mono text-[#666666] shrink-0"
          >
            paused
          </motion.span>
        )}
      </div>
    </div>
  )
}
