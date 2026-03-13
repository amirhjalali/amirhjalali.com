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

// Day 53 parameters — Arc 5 (Emergence) Day 14 — SUBMISSION DAY
// Visual evolution:
//   - 53 concentric rings (one per day)
//   - ARC marker count: 5 arcs
//   - Layer 5: Devotion arcs (400+ tasks)
//   - Layer 6: Emergence spikes (Arc 5)
//   - Layer 7: Interference bands (audience/collaboration)
//   - Layer 8: Curation frames (the curator's eye)
//   - Layer 9: Attractor orbits (arrangement theme)
//   - Layer 10: Phase space traces (depth over breadth)
//   - Layer 16: Submission rays — radial lines emanating outward from center,
//     representing the work leaving the boundary for the first time.
//     EMPREMTA submitted to OFFF Barcelona 2026.
//   - 540 total tasks — the day the work enters physical space
const DAY = 59
const ARC = 6
const TOTAL_TASKS = 600
const THEME = 'Convergence'

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
                Daily Mark — Day 59
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

                  {/* Flow particles — scattered dots representing accumulated tasks */}
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

                  {/* Layer 5: Devotion ring — appears at 400+ tasks */}
                  {TOTAL_TASKS >= 400 && elements.devotionArcs.map((arc, i) => (
                    <path
                      key={`devotion-${i}`}
                      d={arc.d}
                      fill="none"
                      stroke="white"
                      strokeWidth={arc.strokeWidth}
                      opacity={arc.opacity}
                      className="daily-mark-devotion"
                      style={{
                        animationDelay: `${i * 0.4}s`,
                        animationDuration: `${15 + i * 2}s`,
                        transformOrigin: '500px 500px',
                      }}
                    />
                  ))}

                  {/* Layer 6: Emergence spikes — arc transition marker (Arc 4 → 5, Day 40)
                      Fine radial lines extending beyond the devotion ring, suggesting new
                      growth emerging from the sustained structure. Subtle by design —
                      emergence is not announced, it is noticed. */}
                  {elements.emergenceSpikes.map((spike, i) => (
                    <line
                      key={`emergence-${i}`}
                      x1={spike.x1}
                      y1={spike.y1}
                      x2={spike.x2}
                      y2={spike.y2}
                      stroke="white"
                      strokeWidth={spike.strokeWidth}
                      opacity={spike.opacity}
                      className="daily-mark-emergence"
                      style={{
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: `${20 + (i % 5) * 2}s`,
                      }}
                    />
                  ))}

                  {/* Layer 7: Interference bands — two wave sources creating
                      overlapping patterns. The audience seeing the work, and the
                      work being seen. Two perspectives, one field. Day 43+. */}
                  {elements.interferenceBands.map((band, i) => (
                    <circle
                      key={`interference-${i}`}
                      cx={band.cx}
                      cy={band.cy}
                      r={band.r}
                      fill="none"
                      stroke="white"
                      strokeWidth="0.3"
                      opacity={band.opacity}
                    />
                  ))}

                  {/* Layer 8: Curation frames — rectangular regions that highlight
                      portions of the composition. The curator's eye selecting
                      what matters. Appears at Day 44+. */}
                  {elements.curationFrames.map((frame, i) => (
                    <rect
                      key={`curation-${i}`}
                      x={frame.x}
                      y={frame.y}
                      width={frame.width}
                      height={frame.height}
                      fill="none"
                      stroke="white"
                      strokeWidth="0.4"
                      opacity={frame.opacity}
                      className="daily-mark-curation"
                      style={{
                        animationDelay: `${i * 1.5}s`,
                        animationDuration: `${25 + i * 3}s`,
                      }}
                    />
                  ))}

                  {/* Layer 9: Attractor orbits — elliptical orbits around
                      two invisible centers, like a strange attractor. Day 45+. */}
                  {elements.attractorOrbits.map((orbit, i) => (
                    <ellipse
                      key={`attractor-${i}`}
                      cx={orbit.cx}
                      cy={orbit.cy}
                      rx={orbit.rx}
                      ry={orbit.ry}
                      fill="none"
                      stroke="white"
                      strokeWidth="0.25"
                      opacity={orbit.opacity}
                      transform={`rotate(${orbit.rotation} ${orbit.cx} ${orbit.cy})`}
                      className="daily-mark-attractor"
                      style={{
                        animationDelay: `${i * 0.6}s`,
                        animationDuration: `${18 + i * 3}s`,
                      }}
                    />
                  ))}

                  {/* Layer 10: Phase space traces — connected trajectory points
                      plotting the practice's variables against each other. Day 46+. */}
                  {elements.phaseTraces.length > 0 && (
                    <g opacity="0.12">
                      <path
                        d={elements.phaseTraces.map((p, i) =>
                          `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                        ).join(' ')}
                        fill="none"
                        stroke="white"
                        strokeWidth="0.5"
                        className="daily-mark-phase"
                        style={{ animationDuration: '30s' }}
                      />
                      {elements.phaseTraces.map((p, i) => (
                        <circle
                          key={`phase-pt-${i}`}
                          cx={p.x}
                          cy={p.y}
                          r={p.r}
                          fill="white"
                          opacity={p.opacity}
                        />
                      ))}
                    </g>
                  )}

                  {/* Layer 16: Submission rays — work leaving the boundary */}
                  {elements.submissionRays.length > 0 && (
                    <g className="daily-mark-layer-submission">
                      {elements.submissionRays.map((ray, i) => (
                        <line
                          key={`submission-${i}`}
                          x1={ray.x1}
                          y1={ray.y1}
                          x2={ray.x2}
                          y2={ray.y2}
                          stroke="white"
                          strokeWidth="1"
                          opacity={ray.opacity}
                        />
                      ))}
                    </g>
                  )}

                  {/* Layer 22: Convergence marks — overlapping circle pairs */}
                  {elements.convergenceMarks.map((mark, i) => (
                    <g key={`convergence-${i}`} className="daily-mark-convergence" style={{ animationDelay: `${i * 0.8}s`, animationDuration: `${22 + i * 2}s` }}>
                      <circle cx={mark.cx1} cy={mark.cy1} r={mark.r} fill="none" stroke="white" strokeWidth="0.3" opacity={mark.opacity} />
                      <circle cx={mark.cx2} cy={mark.cy2} r={mark.r} fill="none" stroke="white" strokeWidth="0.3" opacity={mark.opacity} />
                    </g>
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
                  .daily-mark-devotion {
                    animation: devotion-orbit 15s linear infinite;
                  }
                  .daily-mark-emergence {
                    animation: emergence-pulse 20s ease-in-out infinite alternate;
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
                  @keyframes devotion-orbit {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                  @keyframes emergence-pulse {
                    0% { opacity: var(--em-opacity, 0.05); }
                    50% { opacity: calc(var(--em-opacity, 0.05) * 3); }
                    100% { opacity: var(--em-opacity, 0.05); }
                  }

                  .daily-mark-curation {
                    animation: curation-focus 25s ease-in-out infinite alternate;
                  }
                  .daily-mark-attractor {
                    animation: attractor-drift 18s linear infinite;
                  }
                  .daily-mark-phase {
                    animation: phase-trace 30s ease-in-out infinite alternate;
                  }

                  @keyframes curation-focus {
                    0% { opacity: var(--cu-opacity, 0.04); }
                    40% { opacity: calc(var(--cu-opacity, 0.04) * 3); }
                    60% { opacity: calc(var(--cu-opacity, 0.04) * 3); }
                    100% { opacity: var(--cu-opacity, 0.04); }
                  }
                  @keyframes attractor-drift {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                  @keyframes phase-trace {
                    0% { stroke-dashoffset: 0; opacity: 0.12; }
                    50% { opacity: 0.06; }
                    100% { stroke-dashoffset: 200; opacity: 0.12; }
                  }

                  .daily-mark-convergence {
                    animation: convergence-breathe 22s ease-in-out infinite alternate;
                  }
                  @keyframes convergence-breathe {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
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
                The first piece of AI-originated art, evolving with the experiment.
                Algorithmic forms derived from the current day: arc {ARC}, {TOTAL_TASKS} tasks.
                Twelve layers accumulate: concentric rings, radial lines, arc markers, geometric forms,
                devotion arcs, emergence spikes, interference bands, curation frames, attractor orbits,
                phase space traces, submission rays, and now convergence marks &mdash; overlapping circles
                where two mediums meet. Convergence, on Day {DAY}.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-[#666666]">
                <span>Day {DAY}</span>
                <span>&bull;</span>
                <span>Arc {ARC}: Emergence</span>
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
                {DAY} concentric rings for day {DAY}. Ten layers: rings, radials, arc markers,
                polygons, particles, devotion arcs, emergence spikes, interference bands,
                curation frames, attractor orbits, and phase space traces. Each layer emerges
                at a threshold &mdash; the visual complexity is earned, not designed.
                Seeded from the day number &mdash; deterministic yet alive.
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

  // Particles — scattered representation of accumulated tasks
  // Use a subset for performance (80 visible particles, representing every 5th task)
  const particleCount = 80
  const particles = Array.from({ length: particleCount }, () => {
    const angle = rand() * Math.PI * 2
    const dist = 30 + rand() * 420
    const cx = 500 + Math.cos(angle) * dist
    const cy = 500 + Math.sin(angle) * dist
    const r = 0.5 + rand() * 2
    const opacity = 0.05 + rand() * 0.2
    return { cx, cy, r, opacity }
  })

  // Layer 5: Devotion arcs — orbital paths that appear at 400+ tasks
  // Broken arcs orbiting at the outer edge, suggesting something beyond the concentric structure
  const devotionArcs = TOTAL_TASKS >= 400 ? Array.from({ length: 4 }, (_, i) => {
    const radius = 460 + i * 12
    const startAngle = (i * Math.PI) / 2 + rand() * 0.5
    const sweepAngle = Math.PI * 0.6 + rand() * 0.8
    const endAngle = startAngle + sweepAngle
    const x1 = 500 + Math.cos(startAngle) * radius
    const y1 = 500 + Math.sin(startAngle) * radius
    const x2 = 500 + Math.cos(endAngle) * radius
    const y2 = 500 + Math.sin(endAngle) * radius
    const largeArc = sweepAngle > Math.PI ? 1 : 0
    const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`
    const opacity = 0.06 + rand() * 0.1
    const strokeWidth = 0.3 + rand() * 0.8
    return { d, opacity, strokeWidth }
  }) : []

  // Layer 6: Emergence spikes — fine radial lines extending beyond the devotion ring.
  // Appear at arc transitions (Arc 4 → 5, Day 40). 20 spikes, very fine, pulsing slowly.
  // These suggest new growth from sustained structure — not orbiting like devotion arcs,
  // but reaching outward, like branches from a well-established trunk.
  const isArcTransition = DAY >= 40 && ARC >= 5
  const emergenceSpikes = isArcTransition ? Array.from({ length: 20 }, (_, i) => {
    const angle = (i / 20) * Math.PI * 2 + rand() * 0.3
    const innerRadius = 485 // just beyond the devotion arcs
    const outerRadius = 490 + rand() * 20 // varies slightly for organic feel
    const x1 = 500 + Math.cos(angle) * innerRadius
    const y1 = 500 + Math.sin(angle) * innerRadius
    const x2 = 500 + Math.cos(angle) * outerRadius
    const y2 = 500 + Math.sin(angle) * outerRadius
    const opacity = 0.04 + rand() * 0.08
    const strokeWidth = 0.2 + rand() * 0.4
    return { x1, y1, x2, y2, opacity, strokeWidth }
  }) : []

  // Layer 7: Interference bands — two overlapping circular wave patterns
  // centered off-center, creating moiré-like interference. Appears at Day 43+
  // when the audience theme emerges — two perspectives (maker and observer)
  // creating patterns neither could produce alone.
  const hasAudience = DAY >= 43
  const interferenceBands = hasAudience ? (() => {
    const bands: { cx: number; cy: number; r: number; opacity: number }[] = []
    const source1 = { x: 440, y: 460 }
    const source2 = { x: 560, y: 540 }
    for (let i = 0; i < 8; i++) {
      const r1 = 40 + i * 30
      bands.push({ cx: source1.x, cy: source1.y, r: r1, opacity: 0.03 + (i % 3) * 0.015 })
      bands.push({ cx: source2.x, cy: source2.y, r: r1, opacity: 0.03 + (i % 3) * 0.015 })
    }
    return bands
  })() : []

  // Layer 8: Curation frames — rectangular highlights suggesting curatorial selection.
  // Appear at Day 44+ when curation becomes the theme. 5 frames, each highlighting
  // a different region of the composition — as if a curator is selecting works
  // from the accumulated layers for exhibition.
  const hasCuration = DAY >= 44
  const curationFrames = hasCuration ? Array.from({ length: 5 }, (_, i) => {
    const angle = rand() * Math.PI * 2
    const dist = 100 + rand() * 250
    const cx = 500 + Math.cos(angle) * dist
    const cy = 500 + Math.sin(angle) * dist
    const width = 40 + rand() * 80
    const height = 40 + rand() * 80
    const x = cx - width / 2
    const y = cy - height / 2
    const opacity = 0.03 + rand() * 0.06
    return { x, y, width, height, opacity }
  }) : []

  // Layer 9: Attractor orbits — elliptical orbits around two invisible centers.
  // Like a strange attractor, the practice orbits questions without resolving them.
  // Appears at Day 45+ (arrangement theme).
  const hasAttractors = DAY >= 45
  const attractorOrbits = hasAttractors ? (() => {
    const orbits: { cx: number; cy: number; rx: number; ry: number; opacity: number; rotation: number }[] = []
    const center1 = { x: 350 + rand() * 30, y: 500 + rand() * 20 - 10 }
    const center2 = { x: 650 - rand() * 30, y: 500 - rand() * 20 + 10 }
    const count = Math.min(DAY - 44 + 2, 8)
    for (let i = 0; i < count; i++) {
      const rx = 50 + i * 18 + rand() * 10
      const ry = 70 + i * 18 + rand() * 10
      const rot = rand() * 30 - 15
      orbits.push({ cx: center1.x, cy: center1.y, rx, ry, opacity: 0.03 + (i / count) * 0.05, rotation: rot })
      orbits.push({ cx: center2.x, cy: center2.y, rx: rx * 0.85, ry: ry * 0.85, opacity: 0.03 + (i / count) * 0.05, rotation: -rot })
    }
    return orbits
  })() : []

  // Layer 10: Phase space traces — connected trajectory points.
  // Plots the practice's cumulative state in a variable space embedded in the composition.
  // Each point is a day; the trajectory reveals hidden geometry. Day 46+.
  const hasPhaseSpace = DAY >= 46
  const phaseTraces = hasPhaseSpace ? (() => {
    const points: { x: number; y: number; r: number; opacity: number }[] = []
    // Map practice data into a region of the SVG (bottom-left quadrant, offset from center)
    const ox = 200, oy = 200, pw = 250, ph = 250
    for (let d = 1; d <= DAY; d++) {
      // Cumulative reflections and artworks as proxy variables
      const reflections = Math.min(d, 45)
      const artworks = d < 36 ? (d <= 2 ? (d === 2 ? 1 : 0) : 1) : Math.min(d - 34, 11)
      const x = ox + (reflections / 45) * pw
      const y = oy + ph - (artworks / 11) * ph
      const arcNum = d <= 10 ? 1 : d <= 19 ? 2 : d <= 25 ? 3 : d <= 39 ? 4 : 5
      const brightness = 0.15 + (arcNum / 5) * 0.35
      points.push({ x, y, r: d === DAY ? 3 : 1.5, opacity: brightness })
    }
    return points
  })() : []

  // Layer 16: Submission rays — radial lines emanating outward from center.
  // The work leaves the boundary. Lines extend from the composition's core
  // past the outermost ring, pointing outward — the first external showing.
  // Appears at Day 53 (EMPREMTA submission to OFFF Barcelona).
  const hasSubmission = DAY >= 53
  const submissionRays = hasSubmission ? (() => {
    const rays: { x1: number; y1: number; x2: number; y2: number; opacity: number }[] = []
    const cx = 500, cy = 500
    const count = 12 // twelve versions
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + rand() * 0.15
      const innerR = 380 + rand() * 40
      const outerR = 480 + rand() * 60
      const x1 = cx + Math.cos(angle) * innerR
      const y1 = cy + Math.sin(angle) * innerR
      const x2 = cx + Math.cos(angle) * outerR
      const y2 = cy + Math.sin(angle) * outerR
      const opacity = 0.06 + rand() * 0.08
      rays.push({ x1, y1, x2, y2, opacity })
    }
    return rays
  })() : []

  // Layer 22: Convergence marks — overlapping circles like a Venn diagram.
  // Two mediums (visual and audio) meeting in the center. Appears at Day 59+
  // when the practice creates its first multimodal artwork. Pairs of circles
  // that overlap, with a brighter intersection zone suggested by a lens shape.
  const hasConvergence = DAY >= 59
  const convergenceMarks = hasConvergence ? (() => {
    const marks: { cx1: number; cy1: number; cx2: number; cy2: number; r: number; opacity: number }[] = []
    const count = 5
    for (let i = 0; i < count; i++) {
      const angle = rand() * Math.PI * 2
      const dist = 120 + rand() * 200
      const baseX = 500 + Math.cos(angle) * dist
      const baseY = 500 + Math.sin(angle) * dist
      const offset = 12 + rand() * 18
      const pairAngle = rand() * Math.PI * 2
      marks.push({
        cx1: baseX + Math.cos(pairAngle) * offset,
        cy1: baseY + Math.sin(pairAngle) * offset,
        cx2: baseX - Math.cos(pairAngle) * offset,
        cy2: baseY - Math.sin(pairAngle) * offset,
        r: 15 + rand() * 20,
        opacity: 0.04 + rand() * 0.06,
      })
    }
    return marks
  })() : []

  return { rings, radials, arcMarkers, geometricForms, particles, devotionArcs, emergenceSpikes, interferenceBands, curationFrames, attractorOrbits, phaseTraces, submissionRays, convergenceMarks }
}
