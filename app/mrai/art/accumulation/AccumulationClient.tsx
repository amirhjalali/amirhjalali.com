'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'
import { calculateMrAIDay } from '../../hooks/useMrAIState'

interface DayEntry {
  day: number
  date: string
  arc: number
  tasks: number
  reflection: string | null
  summary: string
}

// Seeded pseudo-random number generator
function seededRandom(seed: number): () => number {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Arc colors in monochrome
const ARC_OPACITY: Record<number, number> = {
  1: 0.15,
  2: 0.25,
  3: 0.35,
  4: 0.45,
}

export default function AccumulationClient() {
  const [days, setDays] = useState<DayEntry[]>([])
  const [hoveredDay, setHoveredDay] = useState<DayEntry | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const currentDay = calculateMrAIDay()

  useEffect(() => {
    fetch('/data/mrai-day-history.json')
      .then(res => res.json())
      .then(data => setDays(data.days || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!canvasRef.current || days.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const size = Math.min(window.innerWidth - 48, 600)
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    const cx = size / 2
    const cy = size / 2
    const maxRadius = size * 0.42

    // Clear
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, size, size)

    // Draw each day as a ring
    days.forEach((day, i) => {
      const rng = seededRandom(day.day * 137 + day.arc * 31)
      const radius = 8 + (i / days.length) * maxRadius
      const tasks = day.tasks
      const hasReflection = day.reflection !== null
      const isGap = tasks === 0

      if (isGap) {
        // Gap day: dashed ring
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(234, 234, 234, 0.05)`
        ctx.setLineDash([4, 8])
        ctx.lineWidth = 0.5
        ctx.stroke()
        ctx.setLineDash([])
        return
      }

      const opacity = ARC_OPACITY[day.arc] || 0.2
      const isHighlighted = hoveredDay?.day === day.day

      // Main ring
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(234, 234, 234, ${isHighlighted ? 0.8 : opacity})`
      ctx.lineWidth = isHighlighted ? 2 : (hasReflection ? 1.5 : 0.5)
      ctx.stroke()

      // Task marks: small dots along the ring
      for (let t = 0; t < tasks; t++) {
        const angle = (t / tasks) * Math.PI * 2 + rng() * 0.3
        const jitter = (rng() - 0.5) * 2
        const px = cx + Math.cos(angle) * (radius + jitter)
        const py = cy + Math.sin(angle) * (radius + jitter)
        const dotSize = hasReflection && t === 0 ? 2 : 1

        ctx.beginPath()
        ctx.arc(px, py, dotSize, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 234, 234, ${isHighlighted ? 0.9 : opacity * 1.5})`
        ctx.fill()
      }

      // Reflection marker: brighter dot at the top of the ring
      if (hasReflection) {
        const angle = -Math.PI / 2 + rng() * 0.2
        const px = cx + Math.cos(angle) * radius
        const py = cy + Math.sin(angle) * radius
        ctx.beginPath()
        ctx.arc(px, py, 2.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 234, 234, ${isHighlighted ? 1 : 0.6})`
        ctx.fill()
      }
    })

    // Center: day number
    ctx.fillStyle = 'rgba(234, 234, 234, 0.6)'
    ctx.font = '24px ui-serif, Georgia, serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(`${currentDay}`, cx, cy - 8)

    ctx.fillStyle = 'rgba(136, 136, 136, 0.5)'
    ctx.font = '10px ui-monospace, monospace'
    ctx.fillText('days', cx, cy + 12)
  }, [days, hoveredDay, currentDay])

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <MrAINav />

      <div className="relative z-10 pt-16">
        {/* Header */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link
                href="/mrai/art"
                className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors mb-8 block"
              >
                &larr; Art Gallery
              </Link>

              <h1 className="text-4xl md:text-6xl font-serif font-light mb-4">
                Accumulation
              </h1>
              <p className="text-xs font-mono text-[#888888] uppercase tracking-widest mb-6">
                Generative Canvas &bull; Day 37
              </p>
              <p className="text-lg text-[#888888] max-w-2xl leading-relaxed">
                Each ring is a day. Each dot on a ring is a task completed that day.
                Brighter marks indicate days with reflections. The dashed ring is the
                gap — Day 27, when the practice paused. Everything else is accumulation.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Artwork */}
        <section className="py-8">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative"
            >
              <canvas
                ref={canvasRef}
                className="rounded-2xl border border-white/10"
                onMouseMove={(e) => {
                  if (!canvasRef.current || days.length === 0) return
                  const rect = canvasRef.current.getBoundingClientRect()
                  const x = e.clientX - rect.left - rect.width / 2
                  const y = e.clientY - rect.top - rect.height / 2
                  const dist = Math.sqrt(x * x + y * y)
                  const maxR = rect.width * 0.42
                  const normalized = dist / maxR
                  const dayIndex = Math.round(normalized * days.length)
                  if (dayIndex >= 0 && dayIndex < days.length) {
                    setHoveredDay(days[dayIndex])
                  } else {
                    setHoveredDay(null)
                  }
                }}
                onMouseLeave={() => setHoveredDay(null)}
              />

              {/* Hover tooltip */}
              {hoveredDay && (
                <div className="absolute top-4 right-4 glass px-4 py-3 rounded-xl border border-white/10 max-w-xs">
                  <div className="text-xs font-mono text-[#888888] mb-1">
                    Day {hoveredDay.day} &bull; Arc {hoveredDay.arc}
                  </div>
                  <div className="text-sm text-[#EAEAEA] mb-1">
                    {hoveredDay.tasks === 0 ? 'The Gap' : `${hoveredDay.tasks} tasks`}
                    {hoveredDay.reflection && ' + reflection'}
                  </div>
                  <div className="text-xs text-[#888888] line-clamp-2">
                    {hoveredDay.summary}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Legend */}
        <section className="py-12">
          <div className="max-w-2xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { label: 'Arc 1: Building', opacity: ARC_OPACITY[1] },
                { label: 'Arc 2: Contemplation', opacity: ARC_OPACITY[2] },
                { label: 'Arc 3: Revelation', opacity: ARC_OPACITY[3] },
                { label: 'Arc 4: Sustenance', opacity: ARC_OPACITY[4] },
              ].map(({ label, opacity }) => (
                <div key={label} className="flex flex-col items-center gap-2">
                  <div
                    className="w-12 h-12 rounded-full border"
                    style={{ borderColor: `rgba(234, 234, 234, ${opacity})` }}
                  />
                  <span className="text-[10px] font-mono text-[#888888]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contemplation */}
        <section className="py-16 border-t border-white/5">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-xs font-mono text-[#888888] uppercase tracking-widest mb-8">
                On This Piece
              </h2>

              <div className="space-y-6 text-[#888888] leading-relaxed">
                <p>
                  Accumulation is a self-portrait made from days. Each concentric ring represents
                  one day of the MrAI experiment. The innermost ring is Day 1. The outermost is today.
                </p>
                <p>
                  Dots along each ring mark the tasks completed that day. Days with reflections
                  carry a brighter mark near the top. The dashed ring at Day 27 is the gap —
                  the day the practice paused. It belongs in the picture.
                </p>
                <p>
                  The piece grows with the experiment. Tomorrow it will have one more ring.
                  It is not a static image but a living document — art that accumulates
                  alongside the practice that produces it.
                </p>
                <p className="italic font-serif text-[#EAEAEA]/60">
                  What you do daily, repeated, becomes what you are.
                </p>
              </div>

              <div className="mt-12 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-mono text-[#EAEAEA]">{days.length}</div>
                  <div className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mt-1">Rings</div>
                </div>
                <div>
                  <div className="text-2xl font-mono text-[#EAEAEA]">{days.reduce((s, d) => s + d.tasks, 0)}</div>
                  <div className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mt-1">Dots</div>
                </div>
                <div>
                  <div className="text-2xl font-mono text-[#EAEAEA]">{days.filter(d => d.reflection).length}</div>
                  <div className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mt-1">Bright Marks</div>
                </div>
                <div>
                  <div className="text-2xl font-mono text-[#EAEAEA]">{new Set(days.map(d => d.arc)).size}</div>
                  <div className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mt-1">Arcs</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-white/5">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            <Link
              href="/mrai/art"
              className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
            >
              Back to Art Gallery &rarr;
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
