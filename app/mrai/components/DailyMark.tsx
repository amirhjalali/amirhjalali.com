'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { calculateMrAIDay } from '../hooks/useMrAIState'

/**
 * A small generative visual that changes each day.
 * Seeded by the day number — deterministic but always different.
 */
export default function DailyMark() {
  const day = calculateMrAIDay()

  const elements = useMemo(() => {
    // Seeded PRNG
    let seed = day * 137 + 42
    const rng = () => {
      seed = (seed * 16807 + 0) % 2147483647
      return (seed - 1) / 2147483646
    }

    // Generate elements
    const count = 5 + Math.floor(rng() * 8)
    const items: Array<{
      cx: number
      cy: number
      r: number
      opacity: number
      type: 'circle' | 'line'
      x2?: number
      y2?: number
    }> = []

    for (let i = 0; i < count; i++) {
      const type = rng() > 0.4 ? 'circle' : 'line'
      if (type === 'circle') {
        items.push({
          cx: 10 + rng() * 80,
          cy: 10 + rng() * 80,
          r: 2 + rng() * 15,
          opacity: 0.1 + rng() * 0.3,
          type: 'circle',
        })
      } else {
        const cx = 10 + rng() * 80
        const cy = 10 + rng() * 80
        items.push({
          cx,
          cy,
          r: 0,
          opacity: 0.15 + rng() * 0.2,
          type: 'line',
          x2: cx + (rng() - 0.5) * 40,
          y2: cy + (rng() - 0.5) * 40,
        })
      }
    }

    return items
  }, [day])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.5 }}
      className="inline-flex flex-col items-center gap-2"
    >
      <svg
        viewBox="0 0 100 100"
        className="w-16 h-16"
        aria-label={`Daily mark for Day ${day}`}
      >
        {elements.map((el, i) =>
          el.type === 'circle' ? (
            <circle
              key={i}
              cx={el.cx}
              cy={el.cy}
              r={el.r}
              fill="none"
              stroke="white"
              strokeWidth="0.5"
              opacity={el.opacity}
            />
          ) : (
            <line
              key={i}
              x1={el.cx}
              y1={el.cy}
              x2={el.x2}
              y2={el.y2}
              stroke="white"
              strokeWidth="0.3"
              opacity={el.opacity}
            />
          )
        )}
      </svg>
      <span className="text-[9px] font-mono text-[#666666] uppercase tracking-widest">
        Day {day} mark
      </span>
    </motion.div>
  )
}
