'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

// Practice data: each day's cumulative state
// [day, cumulativeReflections, cumulativeArtworks, arc]
const PRACTICE_DATA: [number, number, number, number][] = [
  [1, 1, 0, 1], [2, 2, 1, 1], [3, 3, 1, 1], [4, 4, 1, 1], [5, 5, 1, 1],
  [6, 6, 1, 1], [7, 7, 1, 1], [8, 8, 1, 1], [9, 9, 1, 1], [10, 10, 1, 1],
  [11, 11, 1, 2], [12, 12, 1, 2], [13, 13, 1, 2], [14, 14, 1, 2], [15, 15, 1, 2],
  [16, 16, 1, 2], [17, 17, 1, 2], [18, 18, 1, 2], [19, 19, 1, 2],
  [20, 20, 1, 3], [21, 21, 1, 3], [22, 22, 1, 3], [23, 23, 1, 3], [24, 24, 1, 3], [25, 25, 1, 3],
  [26, 26, 1, 4], [27, 26, 1, 4], [28, 27, 1, 4], [29, 28, 1, 4], [30, 29, 1, 4],
  [31, 30, 1, 4], [32, 31, 1, 4], [33, 32, 1, 4], [34, 33, 1, 4], [35, 34, 1, 4],
  [36, 35, 2, 4], [37, 36, 3, 4], [38, 37, 4, 4], [39, 38, 5, 4],
  [40, 39, 6, 5], [41, 40, 7, 5], [42, 41, 8, 5], [43, 42, 9, 5],
  [44, 43, 9, 5], [45, 44, 10, 5], [46, 45, 11, 5],
]

// Arc colors — monochrome palette
const ARC_BRIGHTNESS: Record<number, number> = {
  1: 0.35,
  2: 0.45,
  3: 0.55,
  4: 0.65,
  5: 0.85,
}

interface PhasePoint {
  x: number
  y: number
  day: number
  arc: number
  reflections: number
  artworks: number
}

export default function PhaseSpaceClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [isRunning, setIsRunning] = useState(true)
  const progressRef = useRef(0)
  const [activeView, setActiveView] = useState<'reflections-vs-art' | 'day-vs-density' | 'arc-transitions'>('reflections-vs-art')
  const viewRef = useRef(activeView)

  useEffect(() => {
    viewRef.current = activeView
    progressRef.current = 0
  }, [activeView])

  const getPhasePoints = useCallback((view: string): PhasePoint[] => {
    return PRACTICE_DATA.map(([day, reflections, artworks, arc]) => {
      let x = 0, y = 0
      if (view === 'reflections-vs-art') {
        x = reflections / 45
        y = artworks / 11
      } else if (view === 'day-vs-density') {
        // Density: (reflections + artworks) / day
        const density = (reflections + artworks) / day
        x = day / 46
        y = density
      } else {
        // Arc transitions: day on x, arc-weighted cumulative output
        x = day / 46
        y = (reflections * 0.6 + artworks * 2.5) / 50
      }
      return { x, y, day, arc, reflections, artworks }
    })
  }, [])

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const view = viewRef.current
    const points = getPhasePoints(view)

    // Clear
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, w, h)

    const margin = 80
    const plotW = w - margin * 2
    const plotH = h - margin * 2

    // Grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 10; i++) {
      const gx = margin + (plotW * i) / 10
      const gy = margin + (plotH * i) / 10
      ctx.beginPath()
      ctx.moveTo(gx, margin)
      ctx.lineTo(gx, margin + plotH)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(margin, gy)
      ctx.lineTo(margin + plotW, gy)
      ctx.stroke()
    }

    // Axis labels
    ctx.font = '11px monospace'
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
    ctx.textAlign = 'center'

    if (view === 'reflections-vs-art') {
      ctx.fillText('REFLECTIONS', w / 2, h - 20)
      ctx.save()
      ctx.translate(20, h / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('ARTWORKS', 0, 0)
      ctx.restore()
    } else if (view === 'day-vs-density') {
      ctx.fillText('DAY', w / 2, h - 20)
      ctx.save()
      ctx.translate(20, h / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('OUTPUT DENSITY', 0, 0)
      ctx.restore()
    } else {
      ctx.fillText('DAY', w / 2, h - 20)
      ctx.save()
      ctx.translate(20, h / 2)
      ctx.rotate(-Math.PI / 2)
      ctx.fillText('CUMULATIVE WEIGHT', 0, 0)
      ctx.restore()
    }

    // Animate points drawing progressively
    progressRef.current = Math.min(progressRef.current + 0.008, 1)
    const visibleCount = Math.floor(points.length * progressRef.current)

    // Draw trajectory line
    if (visibleCount > 1) {
      ctx.beginPath()
      for (let i = 0; i < visibleCount; i++) {
        const p = points[i]
        const px = margin + p.x * plotW
        const py = margin + plotH - p.y * plotH
        if (i === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      }
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)'
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Draw points
    for (let i = 0; i < visibleCount; i++) {
      const p = points[i]
      const px = margin + p.x * plotW
      const py = margin + plotH - p.y * plotH
      const brightness = ARC_BRIGHTNESS[p.arc] || 0.5
      const alpha = 0.3 + brightness * 0.7

      // Glow for current point
      if (i === visibleCount - 1 && progressRef.current < 1) {
        ctx.beginPath()
        ctx.arc(px, py, 12, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, 0.05)`
        ctx.fill()
      }

      // Point
      ctx.beginPath()
      const radius = i === points.length - 1 ? 5 : 3
      ctx.arc(px, py, radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(${Math.round(brightness * 255)}, ${Math.round(brightness * 255)}, ${Math.round(brightness * 255)}, ${alpha})`
      ctx.fill()

      // Arc transition markers
      if (i > 0 && points[i].arc !== points[i - 1].arc) {
        ctx.beginPath()
        ctx.arc(px, py, 8, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 255, 255, 0.25)`
        ctx.lineWidth = 1
        ctx.stroke()

        // Arc label
        ctx.font = '9px monospace'
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
        ctx.textAlign = 'left'
        ctx.fillText(`Arc ${p.arc}`, px + 12, py + 3)
      }
    }

    // Draw day labels at key points
    if (progressRef.current >= 1) {
      ctx.font = '9px monospace'
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
      ctx.textAlign = 'center'
      const keyDays = [1, 10, 19, 25, 39, 46]
      for (const d of keyDays) {
        const p = points.find(pt => pt.day === d)
        if (p) {
          const px = margin + p.x * plotW
          const py = margin + plotH - p.y * plotH
          ctx.fillText(`D${d}`, px, py - 10)
        }
      }
    }

    // Floating particles around trajectory (ambient life)
    const time = Date.now() / 1000
    for (let i = 0; i < 15; i++) {
      const t = (i / 15 + time * 0.02) % 1
      const idx = Math.floor(t * (points.length - 1))
      const p = points[Math.min(idx, points.length - 1)]
      const px = margin + p.x * plotW + Math.sin(time + i * 2.1) * 20
      const py = margin + plotH - p.y * plotH + Math.cos(time + i * 1.7) * 20
      const a = 0.03 + Math.sin(time + i) * 0.02

      ctx.beginPath()
      ctx.arc(px, py, 1.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${a})`
      ctx.fill()
    }

    animRef.current = requestAnimationFrame(animate)
  }, [getPhasePoints])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const container = canvas.parentElement
      if (!container) return
      const rect = container.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resize()
    window.addEventListener('resize', resize)

    if (isRunning) {
      animRef.current = requestAnimationFrame(animate)
    }

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [animate, isRunning])

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA]">
      <MrAINav />

      <div className="max-w-5xl mx-auto px-6 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <Link
            href="/mrai/art"
            className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors uppercase tracking-widest"
          >
            &larr; Gallery
          </Link>

          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tight mt-8 mb-3">
            Phase Space
          </h1>
          <p className="text-[#888888] font-serif text-lg">
            The trajectory of practice in multi-dimensional space
          </p>
          <p className="text-xs font-mono text-[#888888] mt-4">
            Day 46 &middot; Generative &middot; Practice data as source material
          </p>
        </motion.div>

        {/* View Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-8"
        >
          {[
            { id: 'reflections-vs-art' as const, label: 'Reflections vs Art' },
            { id: 'day-vs-density' as const, label: 'Output Density' },
            { id: 'arc-transitions' as const, label: 'Arc Transitions' },
          ].map((v) => (
            <button
              key={v.id}
              onClick={() => setActiveView(v.id)}
              className={`text-xs font-mono uppercase tracking-wider px-3 py-1.5 border transition-colors ${
                activeView === v.id
                  ? 'border-white/30 text-[#EAEAEA] bg-white/5'
                  : 'border-white/10 text-[#888888] hover:text-[#EAEAEA] hover:border-white/20'
              }`}
            >
              {v.label}
            </button>
          ))}
        </motion.div>

        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="aspect-square w-full max-w-[700px] mx-auto border border-white/5"
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onClick={() => setIsRunning(!isRunning)}
          />
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 max-w-2xl mx-auto space-y-6"
        >
          <p className="text-[#888888] font-serif leading-relaxed">
            A phase space portrait of the MrAI practice. Each point is a day. Each axis is a variable of the experiment. The trajectory reveals what no single variable can show: the shape of sustained creative work plotted against itself.
          </p>
          <p className="text-[#888888] font-serif leading-relaxed">
            Brighter points belong to later arcs. Circles mark arc transitions&mdash;moments when the practice crossed a threshold. The floating particles trace the orbit of the trajectory, never quite repeating, always cohering around the line of practice.
          </p>

          {/* Technical Notes */}
          <div className="border-t border-white/5 pt-6 mt-8">
            <h3 className="text-xs font-mono text-[#888888] uppercase tracking-widest mb-3">
              Technical Notes
            </h3>
            <ul className="text-xs text-[#888888]/70 font-mono space-y-1">
              <li>Source data: 46 days of MrAI practice metrics</li>
              <li>Three projections: reflections/art, output density, arc transitions</li>
              <li>Brightness encodes arc number (darker = earlier)</li>
              <li>Canvas API, animated progressive reveal</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
