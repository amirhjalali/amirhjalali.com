'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { calculateMrAIDay } from '../hooks/useMrAIState'

// Arc determines the visual character
const ARC_FOR_DAY = (d: number) =>
  d <= 10 ? 1 : d <= 19 ? 2 : d <= 25 ? 3 : d <= 39 ? 4 : 5

/**
 * A small generative visual that changes each day.
 * Complexity grows with the day number — Day 1 is sparse,
 * Day 38 carries the weight of 38 days.
 */
export default function DailyMark() {
  const day = calculateMrAIDay()

  const svgContent = useMemo(() => {
    const arc = ARC_FOR_DAY(day)

    // Seeded PRNG
    let seed = day * 137 + arc * 31 + 42
    const rng = () => {
      seed = (seed * 16807 + 0) % 2147483647
      return (seed - 1) / 2147483646
    }

    const elements: React.ReactNode[] = []

    // Layer 1: Concentric rings — count grows with day
    const ringCount = Math.min(Math.floor(day / 3) + 1, 15)
    for (let i = 0; i < ringCount; i++) {
      const r = 5 + (i / ringCount) * 40
      const opacity = 0.05 + (i / ringCount) * 0.15
      elements.push(
        <circle
          key={`ring-${i}`}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="white"
          strokeWidth={i === ringCount - 1 ? '0.8' : '0.3'}
          opacity={opacity}
        />
      )
    }

    // Layer 2: Radial lines — emerge after Day 5
    if (day > 5) {
      const lineCount = Math.min(Math.floor(day / 4), 12)
      for (let i = 0; i < lineCount; i++) {
        const angle = (i / lineCount) * Math.PI * 2 + rng() * 0.3
        const innerR = 8 + rng() * 10
        const outerR = 25 + rng() * 20
        elements.push(
          <line
            key={`rad-${i}`}
            x1={50 + Math.cos(angle) * innerR}
            y1={50 + Math.sin(angle) * innerR}
            x2={50 + Math.cos(angle) * outerR}
            y2={50 + Math.sin(angle) * outerR}
            stroke="white"
            strokeWidth="0.3"
            opacity={0.1 + rng() * 0.15}
          />
        )
      }
    }

    // Layer 3: Dots — one per accumulated "decade" of tasks
    if (day > 10) {
      const dotCount = Math.min(Math.floor(day / 5), 10)
      for (let i = 0; i < dotCount; i++) {
        const angle = rng() * Math.PI * 2
        const dist = 10 + rng() * 35
        elements.push(
          <circle
            key={`dot-${i}`}
            cx={50 + Math.cos(angle) * dist}
            cy={50 + Math.sin(angle) * dist}
            r={0.8 + rng() * 1.2}
            fill="white"
            opacity={0.15 + rng() * 0.25}
          />
        )
      }
    }

    // Layer 4: Arc-specific geometry — emerges after Day 15
    if (day > 15) {
      const sides = arc + 2 // triangle for arc1, square for arc2, etc.
      const polyR = 18 + (day / 50) * 15
      const rotOffset = rng() * Math.PI
      const points = Array.from({ length: sides }, (_, j) => {
        const angle = (j / sides) * Math.PI * 2 + rotOffset
        return `${50 + Math.cos(angle) * polyR},${50 + Math.sin(angle) * polyR}`
      }).join(' ')
      elements.push(
        <polygon
          key="arc-poly"
          points={points}
          fill="none"
          stroke="white"
          strokeWidth="0.4"
          opacity={0.12}
        />
      )
    }

    // Layer 5: Attractor orbits — emerge after Day 44
    // Two invisible centers that points orbit around, like a Lorenz attractor
    if (day > 44) {
      const cx1 = 35 + rng() * 5
      const cy1 = 50 + rng() * 5 - 2.5
      const cx2 = 65 - rng() * 5
      const cy2 = 50 - rng() * 5 + 2.5
      const orbitCount = Math.min(day - 44 + 2, 6)

      for (let i = 0; i < orbitCount; i++) {
        const rx = 8 + i * 3 + rng() * 2
        const ry = 12 + i * 3 + rng() * 2
        const rot = rng() * 30 - 15
        // Orbit around first center
        elements.push(
          <ellipse
            key={`orbit-a-${i}`}
            cx={cx1}
            cy={cy1}
            rx={rx}
            ry={ry}
            fill="none"
            stroke="white"
            strokeWidth="0.2"
            opacity={0.04 + (i / orbitCount) * 0.06}
            transform={`rotate(${rot} ${cx1} ${cy1})`}
          />
        )
        // Orbit around second center
        elements.push(
          <ellipse
            key={`orbit-b-${i}`}
            cx={cx2}
            cy={cy2}
            rx={rx * 0.9}
            ry={ry * 0.9}
            fill="none"
            stroke="white"
            strokeWidth="0.2"
            opacity={0.04 + (i / orbitCount) * 0.06}
            transform={`rotate(${-rot} ${cx2} ${cy2})`}
          />
        )
      }

      // Two faint attractor centers
      elements.push(
        <circle key="attractor-1" cx={cx1} cy={cy1} r={0.6} fill="white" opacity={0.08} />,
        <circle key="attractor-2" cx={cx2} cy={cy2} r={0.6} fill="white" opacity={0.08} />
      )
    }

    // Center point — always present, grows slightly with days
    const centerR = 1 + Math.min(day / 100, 1.5)
    elements.push(
      <circle
        key="center"
        cx="50"
        cy="50"
        r={centerR}
        fill="white"
        opacity={0.5}
      />
    )

    return elements
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
        {svgContent}
      </svg>
      <span className="text-[9px] font-mono text-[#666666] uppercase tracking-widest">
        Day {day} mark
      </span>
    </motion.div>
  )
}
