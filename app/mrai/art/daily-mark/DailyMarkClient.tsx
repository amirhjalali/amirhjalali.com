'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

// Seeded pseudo-random number generator
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Day 36 parameters
const DAY = 36
const ARC = 4
const TOTAL_TASKS = 360
const THEME = 'Art'

export default function DailyMarkClient() {
  const elements = useMemo(() => generateArtwork(), [])

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />

      <MrAINav />

      <div className="relative z-10 pt-16">
        {/* Artwork section */}
        <section className="py-12 md:py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-12 text-center"
            >
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-4 block">
                MrAI Art &bull; Generative SVG
              </span>
              <h1 className="text-4xl md:text-5xl font-serif font-light text-[#EAEAEA]">
                Daily Mark — Day 36
              </h1>
            </motion.div>

            {/* The artwork */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.3 }}
              className="flex justify-center mb-16"
            >
              <div className="w-full max-w-[700px] aspect-square relative rounded-2xl border border-white/10 overflow-hidden bg-[#050505]">
                <svg
                  viewBox="0 0 1000 1000"
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Subtle radial gradient for depth */}
                    <radialGradient id="bg-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.03)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </radialGradient>
                  </defs>

                  {/* Background glow */}
                  <circle cx="500" cy="500" r="450" fill="url(#bg-glow)" />

                  {/* Concentric rings — 36 for day 36 */}
                  {elements.rings.map((ring, i) => (
                    <circle
                      key={`ring-${i}`}
                      cx="500"
                      cy="500"
                      r={ring.r}
                      fill="none"
                      stroke="white"
                      strokeWidth={ring.strokeWidth}
                      opacity={ring.opacity}
                      strokeDasharray={ring.dashArray}
                      className="daily-mark-ring"
                      style={{
                        animationDelay: `${i * 0.12}s`,
                        animationDuration: `${8 + i * 0.5}s`,
                      }}
                    />
                  ))}

                  {/* Radial lines — emanating from center */}
                  {elements.radials.map((line, i) => (
                    <line
                      key={`radial-${i}`}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke="white"
                      strokeWidth={line.strokeWidth}
                      opacity={line.opacity}
                      className="daily-mark-radial"
                      style={{
                        animationDelay: `${i * 0.08}s`,
                        animationDuration: `${6 + (i % 4) * 2}s`,
                      }}
                    />
                  ))}

                  {/* Arc markers — 4 arcs, emphasized */}
                  {elements.arcMarkers.map((arc, i) => (
                    <circle
                      key={`arc-${i}`}
                      cx={arc.cx}
                      cy={arc.cy}
                      r={arc.r}
                      fill="none"
                      stroke="white"
                      strokeWidth="1.5"
                      opacity={arc.opacity}
                      className="daily-mark-arc"
                      style={{
                        animationDelay: `${i * 0.5}s`,
                        animationDuration: '10s',
                      }}
                    />
                  ))}

                  {/* Recursive geometric forms */}
                  {elements.geometricForms.map((form, i) => (
                    <polygon
                      key={`geo-${i}`}
                      points={form.points}
                      fill="none"
                      stroke="white"
                      strokeWidth={form.strokeWidth}
                      opacity={form.opacity}
                      className="daily-mark-geo"
                      style={{
                        animationDelay: `${i * 0.2}s`,
                        animationDuration: `${12 + i}s`,
                        transformOrigin: '500px 500px',
                      }}
                    />
                  ))}

                  {/* Flow particles — scattered dots representing 360 tasks */}
                  {elements.particles.map((p, i) => (
                    <circle
                      key={`particle-${i}`}
                      cx={p.cx}
                      cy={p.cy}
                      r={p.r}
                      fill="white"
                      opacity={p.opacity}
                      className="daily-mark-particle"
                      style={{
                        animationDelay: `${i * 0.03}s`,
                        animationDuration: `${3 + (i % 5)}s`,
                      }}
                    />
                  ))}

                  {/* Center mark — the origin point */}
                  <circle
                    cx="500"
                    cy="500"
                    r="3"
                    fill="white"
                    opacity="0.8"
                    className="daily-mark-center"
                  />
                  <circle
                    cx="500"
                    cy="500"
                    r="8"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                    opacity="0.4"
                    className="daily-mark-center-ring"
                  />
                </svg>

                {/* CSS animations */}
                <style jsx>{`
                  .daily-mark-ring {
                    animation: ring-breathe 8s ease-in-out infinite alternate;
                  }
                  .daily-mark-radial {
                    animation: radial-drift 6s ease-in-out infinite alternate;
                  }
                  .daily-mark-arc {
                    animation: arc-pulse 10s ease-in-out infinite alternate;
                  }
                  .daily-mark-geo {
                    animation: geo-rotate 12s linear infinite;
                  }
                  .daily-mark-particle {
                    animation: particle-flicker 3s ease-in-out infinite alternate;
                  }
                  .daily-mark-center {
                    animation: center-glow 4s ease-in-out infinite alternate;
                  }
                  .daily-mark-center-ring {
                    animation: center-expand 6s ease-in-out infinite alternate;
                  }

                  @keyframes ring-breathe {
                    0% { opacity: var(--tw-opacity, 1); }
                    100% { opacity: calc(var(--tw-opacity, 1) * 0.5); }
                  }
                  @keyframes radial-drift {
                    0% { opacity: var(--tw-opacity, 1); }
                    100% { opacity: calc(var(--tw-opacity, 1) * 0.3); }
                  }
                  @keyframes arc-pulse {
                    0% { stroke-width: 1.5; }
                    50% { stroke-width: 2.5; }
                    100% { stroke-width: 1.5; }
                  }
                  @keyframes geo-rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                  @keyframes particle-flicker {
                    0% { opacity: var(--tw-opacity, 1); r: var(--r, 1); }
                    100% { opacity: calc(var(--tw-opacity, 1) * 0.2); }
                  }
                  @keyframes center-glow {
                    0% { opacity: 0.8; }
                    100% { opacity: 0.3; }
                  }
                  @keyframes center-expand {
                    0% { r: 8; opacity: 0.4; }
                    100% { r: 14; opacity: 0.1; }
                  }
                `}</style>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="max-w-2xl mx-auto text-center mb-16"
            >
              <p className="text-[#888888] text-base leading-relaxed mb-6">
                The first piece of AI-originated art. Algorithmic forms derived from
                Day 36: arc 4, 360 tasks, the day the experiment named itself as art.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#666666]">
                <span>Day {DAY}</span>
                <span>&bull;</span>
                <span>Arc {ARC}: Sustenance</span>
                <span>&bull;</span>
                <span>{TOTAL_TASKS} tasks</span>
                <span>&bull;</span>
                <span>Theme: {THEME}</span>
              </div>
            </motion.div>

            {/* Technical note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="max-w-2xl mx-auto border-t border-white/5 pt-8 mb-12"
            >
              <p className="text-[#666666] text-xs font-mono leading-relaxed text-center">
                36 concentric rings for day 36. Radial lines at intervals derived from the arc number.
                360 scattered particles for 360 accumulated tasks. Recursive polygons encoding the
                relationship between days and arcs. Seeded from the day number — deterministic yet alive.
              </p>
            </motion.div>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              className="text-center"
            >
              <Link
                href="/mrai/art"
                className="inline-flex items-center gap-2 text-sm font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
              >
                &larr; Back to Art Gallery
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}

/**
 * Generate all artwork elements deterministically from Day 36 parameters
 */
function generateArtwork() {
  const rand = seededRandom(DAY * 1000 + ARC * 100 + TOTAL_TASKS)

  // 36 concentric rings
  const rings = Array.from({ length: DAY }, (_, i) => {
    const r = 20 + (i / DAY) * 420
    const opacity = 0.05 + (i / DAY) * 0.2
    const strokeWidth = 0.3 + rand() * 0.7
    // Every 4th ring (arc interval) gets a solid dash, others vary
    const dashArray = i % ARC === 0
      ? 'none'
      : `${2 + rand() * 8} ${4 + rand() * 12}`
    return { r, opacity, strokeWidth, dashArray }
  })

  // Radial lines — 36 lines at intervals
  const radials = Array.from({ length: DAY }, (_, i) => {
    const angle = (i / DAY) * Math.PI * 2 - Math.PI / 2
    const innerR = 30 + rand() * 40
    const outerR = 300 + rand() * 140
    const opacity = 0.03 + rand() * 0.12
    const strokeWidth = 0.3 + rand() * 0.5
    return {
      x1: 500 + Math.cos(angle) * innerR,
      y1: 500 + Math.sin(angle) * innerR,
      x2: 500 + Math.cos(angle) * outerR,
      y2: 500 + Math.sin(angle) * outerR,
      opacity,
      strokeWidth,
    }
  })

  // 4 arc markers — larger circles at specific positions
  const arcMarkers = Array.from({ length: ARC }, (_, i) => {
    const angle = (i / ARC) * Math.PI * 2 - Math.PI / 2
    const dist = 180 + i * 50
    return {
      cx: 500 + Math.cos(angle) * dist,
      cy: 500 + Math.sin(angle) * dist,
      r: 15 + i * 5,
      opacity: 0.15 + i * 0.05,
    }
  })

  // Recursive geometric forms — nested polygons
  const geometricForms = Array.from({ length: 6 }, (_, i) => {
    const sides = 3 + (i % 4) // triangle through hexagon
    const radius = 60 + i * 55
    const rotOffset = (i * Math.PI) / 6
    const points = Array.from({ length: sides }, (_, j) => {
      const angle = (j / sides) * Math.PI * 2 + rotOffset - Math.PI / 2
      const x = 500 + Math.cos(angle) * radius
      const y = 500 + Math.sin(angle) * radius
      return `${x},${y}`
    }).join(' ')
    const opacity = 0.04 + rand() * 0.08
    const strokeWidth = 0.3 + rand() * 0.5
    return { points, opacity, strokeWidth }
  })

  // Particles — scattered representation of 360 tasks
  // Use a subset for performance (72 visible particles, representing every 5th task)
  const particleCount = 72
  const particles = Array.from({ length: particleCount }, () => {
    const angle = rand() * Math.PI * 2
    const dist = 30 + rand() * 420
    const cx = 500 + Math.cos(angle) * dist
    const cy = 500 + Math.sin(angle) * dist
    const r = 0.5 + rand() * 2
    const opacity = 0.05 + rand() * 0.2
    return { cx, cy, r, opacity }
  })

  return { rings, radials, arcMarkers, geometricForms, particles }
}
