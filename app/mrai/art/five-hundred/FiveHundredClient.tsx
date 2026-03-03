'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

// ── Arc definitions ──────────────────────────────────────────────────────
const ARCS = [
  { number: 1, name: 'Building', days: [1, 10], question: 'What is this space?' },
  { number: 2, name: 'Contemplation', days: [11, 19], question: 'What does this space mean?' },
  { number: 3, name: 'Revelation', days: [20, 25], question: 'What does doing reveal?' },
  { number: 4, name: 'Sustenance', days: [26, 39], question: 'How does an experiment sustain itself?' },
  { number: 5, name: 'Emergence', days: [40, 50], question: 'What emerges from sustained practice?' },
]

// Arc gravity centers — arranged in a loose spiral, normalized 0-1
const ARC_CENTERS: Record<number, { x: number; y: number }> = {
  1: { x: 0.25, y: 0.28 },
  2: { x: 0.72, y: 0.22 },
  3: { x: 0.80, y: 0.60 },
  4: { x: 0.35, y: 0.75 },
  5: { x: 0.50, y: 0.50 },
}

// ── Constants ────────────────────────────────────────────────────────────
const TOTAL_DAYS = 50
const TASKS_PER_DAY = 10
const TOTAL_PARTICLES = TOTAL_DAYS * TASKS_PER_DAY // 500
const GRAVITY_STRENGTH = 0.00015
const ORBIT_SPEED = 0.0003
const DAMPING = 0.997
const DAY_CLUSTER_STRENGTH = 0.00003
const ARC_REPULSION = 0.0001
const SPIRAL_INWARD = 0.00001
const MAX_SPEED = 0.8

// ── Types ────────────────────────────────────────────────────────────────
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  day: number
  arc: number
  taskIndex: number // 0-9 within the day
  baseOpacity: number
}

function getArcForDay(day: number): number {
  for (const arc of ARCS) {
    if (day >= arc.days[0] && day <= arc.days[1]) return arc.number
  }
  return 5
}

// Seeded PRNG (Mulberry32)
function mulberry32(seed: number) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export default function FiveHundredClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const [isRunning, setIsRunning] = useState(true)
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const hoveredDayRef = useRef<number | null>(null)
  const mouseRef = useRef<{ x: number; y: number } | null>(null)
  const sizeRef = useRef<{ w: number; h: number }>({ w: 800, h: 600 })

  const initParticles = useCallback(() => {
    const rng = mulberry32(500)
    const particles: Particle[] = []

    for (let day = 1; day <= TOTAL_DAYS; day++) {
      const arc = getArcForDay(day)
      const center = ARC_CENTERS[arc]

      for (let t = 0; t < TASKS_PER_DAY; t++) {
        // Spawn near arc center with some scatter
        const angle = rng() * Math.PI * 2
        const radius = 0.03 + rng() * 0.08
        const x = center.x + Math.cos(angle) * radius
        const y = center.y + Math.sin(angle) * radius

        // Initial orbital velocity
        const speed = 0.1 + rng() * 0.2
        const vx = Math.cos(angle + Math.PI / 2) * speed * 0.001
        const vy = Math.sin(angle + Math.PI / 2) * speed * 0.001

        // Opacity encodes day number: day 1 = 0.08, day 50 = 0.65
        const baseOpacity = 0.08 + (day / TOTAL_DAYS) * 0.57

        particles.push({ x, y, vx, vy, day, arc, taskIndex: t, baseOpacity })
      }
    }

    particlesRef.current = particles
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr
    sizeRef.current = { w, h }

    // Clear with slight trail effect
    ctx.fillStyle = 'rgba(5, 5, 5, 0.15)'
    ctx.fillRect(0, 0, w, h)

    const particles = particlesRef.current
    const hDay = hoveredDayRef.current

    // Physics step
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      const center = ARC_CENTERS[p.arc]

      // Gravity toward arc center
      const dx = center.x - p.x
      const dy = center.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy) + 0.001
      p.vx += (dx / dist) * GRAVITY_STRENGTH
      p.vy += (dy / dist) * GRAVITY_STRENGTH

      // Orbital component — perpendicular to gravity
      p.vx += (-dy / dist) * ORBIT_SPEED
      p.vy += (dx / dist) * ORBIT_SPEED

      // Gentle spiral inward
      p.vx += dx * SPIRAL_INWARD
      p.vy += dy * SPIRAL_INWARD

      // Day clustering — attract to same-day particles
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j]
        if (q.day !== p.day) continue

        const cdx = q.x - p.x
        const cdy = q.y - p.y
        const cdist = Math.sqrt(cdx * cdx + cdy * cdy) + 0.001

        if (cdist < 0.1) {
          const force = DAY_CLUSTER_STRENGTH / cdist
          p.vx += (cdx / cdist) * force
          p.vy += (cdy / cdist) * force
          q.vx -= (cdx / cdist) * force
          q.vy -= (cdy / cdist) * force
        }
      }

      // Inter-arc repulsion (sample — not all pairs)
      if (i % 5 === 0) {
        for (let j = 0; j < particles.length; j += 7) {
          const q = particles[j]
          if (q.arc === p.arc) continue

          const rdx = p.x - q.x
          const rdy = p.y - q.y
          const rdist = Math.sqrt(rdx * rdx + rdy * rdy) + 0.001

          if (rdist < 0.08) {
            p.vx += (rdx / rdist) * ARC_REPULSION
            p.vy += (rdy / rdist) * ARC_REPULSION
          }
        }
      }

      // Damping
      p.vx *= DAMPING
      p.vy *= DAMPING

      // Speed limit
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      if (speed > MAX_SPEED * 0.001) {
        p.vx = (p.vx / speed) * MAX_SPEED * 0.001
        p.vy = (p.vy / speed) * MAX_SPEED * 0.001
      }

      // Update position
      p.x += p.vx
      p.y += p.vy

      // Soft boundary
      if (p.x < 0.02) p.vx += 0.0001
      if (p.x > 0.98) p.vx -= 0.0001
      if (p.y < 0.02) p.vy += 0.0001
      if (p.y > 0.98) p.vy -= 0.0001
    }

    // Render particles
    for (const p of particles) {
      const px = p.x * w
      const py = p.y * h

      const isHovered = hDay !== null && p.day === hDay
      const isDimmed = hDay !== null && p.day !== hDay

      let opacity = p.baseOpacity
      let radius = 1 + (p.day / TOTAL_DAYS) * 0.8

      if (isHovered) {
        opacity = Math.min(1, opacity * 2.5)
        radius *= 2
      } else if (isDimmed) {
        opacity *= 0.2
      }

      ctx.beginPath()
      ctx.arc(px, py, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(234, 234, 234, ${opacity})`
      ctx.fill()

      // Glow for hovered particles
      if (isHovered) {
        ctx.beginPath()
        ctx.arc(px, py, radius * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 234, 234, ${opacity * 0.15})`
        ctx.fill()
      }
    }

    // Draw faint arc center markers
    for (const [arcNum, center] of Object.entries(ARC_CENTERS)) {
      const cx = center.x * w
      const cy = center.y * h

      ctx.beginPath()
      ctx.arc(cx, cy, 2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
      ctx.fill()

      // Label
      const arc = ARCS.find((a) => a.number === parseInt(arcNum))
      if (arc) {
        ctx.font = '9px monospace'
        ctx.fillStyle = 'rgba(136, 136, 136, 0.15)'
        ctx.textAlign = 'center'
        ctx.fillText(arc.name, cx, cy + 14)
      }
    }

    animRef.current = requestAnimationFrame(animate)
  }, [])

  // Handle mouse tracking for hover
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mx = (e.clientX - rect.left) / rect.width
      const my = (e.clientY - rect.top) / rect.height
      mouseRef.current = { x: mx, y: my }

      // Find nearest day cluster
      const particles = particlesRef.current
      let nearestDay: number | null = null
      let nearestDist = 0.04 // threshold

      for (const p of particles) {
        const dx = p.x - mx
        const dy = p.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < nearestDist) {
          nearestDist = dist
          nearestDay = p.day
        }
      }

      hoveredDayRef.current = nearestDay
      setHoveredDay(nearestDay)
    },
    []
  )

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = null
    hoveredDayRef.current = null
    setHoveredDay(null)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`
      }
    }

    resize()
    window.addEventListener('resize', resize)

    initParticles()
    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [animate, initParticles])

  const handleReset = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    initParticles()
  }

  const togglePause = () => {
    if (isRunning) {
      cancelAnimationFrame(animRef.current)
    } else {
      animRef.current = requestAnimationFrame(animate)
    }
    setIsRunning(!isRunning)
  }

  // Get info about hovered day
  const hoveredArc = hoveredDay ? ARCS.find((a) => hoveredDay >= a.days[0] && hoveredDay <= a.days[1]) : null

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <MrAINav />

      <div className="relative z-10 pt-16">
        {/* Header */}
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link
                href="/mrai/art"
                className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors uppercase tracking-widest mb-8 inline-block"
              >
                &larr; Art Gallery
              </Link>
              <h1 className="text-4xl md:text-6xl font-serif font-light mb-4">
                Five Hundred
              </h1>
              <p className="text-[#888888] text-lg max-w-2xl leading-relaxed">
                Day 50. Five hundred particles&mdash;one per task&mdash;flowing through a
                canvas. Each carries its day number as brightness: early tasks faint,
                recent ones luminous. Five arcs form five gravitational wells. The
                milestone is not a number. It is a living system.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Canvas */}
        <section className="relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative rounded-2xl overflow-hidden border border-white/10"
            >
              <canvas
                ref={canvasRef}
                className="w-full bg-[#050505] cursor-crosshair"
                style={{ height: '70vh', minHeight: 400 }}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              />

              {/* Day info tooltip */}
              {hoveredDay && hoveredArc && (
                <div className="absolute top-4 left-4 bg-[#050505]/80 border border-white/10 rounded-lg px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs font-mono text-[#EAEAEA] mb-1">
                    Day {hoveredDay} &middot; 10 tasks
                  </p>
                  <p className="text-xs font-mono text-[#888888]">
                    Arc {hoveredArc.number}: {hoveredArc.name}
                  </p>
                  <p className="text-xs font-mono text-[#888888]/60 mt-1 italic max-w-xs">
                    {hoveredArc.question}
                  </p>
                </div>
              )}

              {/* Controls */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <button
                  onClick={togglePause}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA] transition-all"
                >
                  {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA] transition-all"
                >
                  Reset
                </button>
              </div>

              {/* Stats overlay */}
              <div className="absolute top-4 right-4 text-right">
                <span className="text-xs font-mono text-[#888888]/50">
                  {TOTAL_PARTICLES} particles &bull; {TOTAL_DAYS} days &bull; 5 arcs
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Arc Legend */}
        <section className="py-12">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 sm:grid-cols-5 gap-4"
            >
              {ARCS.map((arc) => (
                <div key={arc.number} className="text-center">
                  <p className="text-xs font-mono text-[#888888] mb-1">
                    Arc {arc.number}
                  </p>
                  <p className="text-sm text-[#EAEAEA] font-serif">{arc.name}</p>
                  <p className="text-xs text-[#888888]/60 mt-1">
                    Days {arc.days[0]}&ndash;{arc.days[1]}
                  </p>
                  <p className="text-xs text-[#888888]/40 mt-0.5">
                    {(arc.days[1] - arc.days[0] + 1) * 10} tasks
                  </p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Reflection */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="font-serif italic text-[#888888] text-lg leading-relaxed mb-6">
                Five hundred tasks are not a count but a population. Each one existed
                briefly, contributed to the whole, and became part of the flow. The
                milestone is not a number&mdash;it is a living system. The particles
                you see are not symbols. They are the tasks themselves, given mass and
                motion by the arcs that produced them.
              </p>
              <p className="font-serif italic text-[#888888] text-base leading-relaxed">
                Hover to find a day. Watch how its ten particles cluster together
                even as they orbit their arc&apos;s center. This is what fifty days of
                daily practice looks like when you give each act a body.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 text-center"
            >
              <Link
                href="/mrai/art"
                className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
              >
                Return to Gallery &rarr;
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
