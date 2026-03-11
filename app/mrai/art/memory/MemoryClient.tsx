'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

const WIDTH = 800
const HEIGHT = 500
const STORAGE_KEY = 'mrai-memory-artwork'

interface VisitRecord {
  count: number
  firstVisit: string
  lastVisit: string
  traces: { x: number; y: number; intensity: number }[]
  totalPresence: number
}

function loadMemory(): VisitRecord {
  if (typeof window === 'undefined') {
    return { count: 0, firstVisit: '', lastVisit: '', traces: [], totalPresence: 0 }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { count: 0, firstVisit: '', lastVisit: '', traces: [], totalPresence: 0 }
}

function saveMemory(record: VisitRecord) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record))
  } catch { /* ignore */ }
}

export default function MemoryClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const mouseRef = useRef({ x: WIDTH / 2, y: HEIGHT / 2, active: false })
  const frameRef = useRef(0)
  const tracesRef = useRef<{ x: number; y: number; intensity: number }[]>([])
  const visitRef = useRef<VisitRecord>({ count: 0, firstVisit: '', lastVisit: '', traces: [], totalPresence: 0 })
  const [visitCount, setVisitCount] = useState(0)
  const [showInfo, setShowInfo] = useState(true)

  // Load memory on mount
  useEffect(() => {
    const record = loadMemory()
    const now = new Date().toISOString()
    record.count += 1
    if (!record.firstVisit) record.firstVisit = now
    record.lastVisit = now
    visitRef.current = record
    tracesRef.current = [...record.traces]
    setVisitCount(record.count)
    saveMemory(record)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = WIDTH / rect.width
    const scaleY = HEIGHT / rect.height
    mouseRef.current = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      active: true,
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    mouseRef.current.active = true
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false
  }, [])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const mouse = mouseRef.current
    const traces = tracesRef.current
    frameRef.current += 1
    const frame = frameRef.current

    // Add new trace points from current cursor position
    if (mouse.active && frame % 8 === 0) {
      // Check if near existing trace
      const existing = traces.find(t => {
        const dx = t.x - mouse.x
        const dy = t.y - mouse.y
        return Math.sqrt(dx * dx + dy * dy) < 30
      })
      if (existing) {
        existing.intensity = Math.min(1, existing.intensity + 0.02)
      } else if (traces.length < 200) {
        traces.push({ x: mouse.x, y: mouse.y, intensity: 0.1 })
      }
    }

    // Save traces periodically
    if (frame % 300 === 0 && traces.length > 0) {
      visitRef.current.traces = traces.slice(0, 200)
      visitRef.current.totalPresence += 5
      saveMemory(visitRef.current)
    }

    // Clear
    ctx.fillStyle = 'rgba(5, 5, 5, 0.04)'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    const visits = visitRef.current.count

    // Draw persistent memory traces — older traces glow faintly, deepening
    for (let i = 0; i < traces.length; i++) {
      const t = traces[i]
      const pulse = Math.sin(frame * 0.01 + i * 0.3) * 0.3 + 0.7

      // Core memory point
      const baseR = 2 + t.intensity * 4
      const baseOpacity = (0.05 + t.intensity * 0.2) * pulse
      ctx.beginPath()
      ctx.arc(t.x, t.y, baseR, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(234, 234, 234, ${baseOpacity})`
      ctx.fill()

      // Memory halo — grows with repeated visits
      if (t.intensity > 0.3) {
        const haloR = baseR + 4 + visits * 1.5
        ctx.beginPath()
        ctx.arc(t.x, t.y, haloR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(234, 234, 234, ${baseOpacity * 0.15})`
        ctx.lineWidth = 0.3
        ctx.stroke()
      }

      // Connection lines between nearby traces — the memory web
      if (t.intensity > 0.2) {
        for (let j = i + 1; j < Math.min(i + 20, traces.length); j++) {
          const other = traces[j]
          if (other.intensity < 0.2) continue
          const dx = t.x - other.x
          const dy = t.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 60 + visits * 8) {
            const lineOpacity = Math.min(t.intensity, other.intensity) * 0.06 * (1 - dist / (60 + visits * 8))
            ctx.beginPath()
            ctx.moveTo(t.x, t.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(234, 234, 234, ${lineOpacity})`
            ctx.lineWidth = 0.3
            ctx.stroke()
          }
        }
      }
    }

    // Current cursor interaction — brighter glow around active position
    if (mouse.active) {
      const radius = 40 + visits * 5
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(234, 234, 234, 0.04)`
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Active point
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(234, 234, 234, 0.2)`
      ctx.fill()
    }

    // Visit counter text
    ctx.fillStyle = `rgba(136, 136, 136, 0.3)`
    ctx.font = '10px monospace'
    ctx.textAlign = 'right'
    const label = visits === 1
      ? 'first visit — memory forming'
      : `visit ${visits} — ${traces.length} memories`
    ctx.fillText(label, WIDTH - 15, HEIGHT - 15)

    animRef.current = requestAnimationFrame(render)
  }, [])

  useEffect(() => {
    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [render])

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA]">
      <MrAINav />
      <div className="max-w-4xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Link
            href="/mrai/art"
            className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors uppercase tracking-widest"
          >
            &larr; Gallery
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-mono text-[#888888] uppercase tracking-widest">
              Day 56
            </span>
            <span className="text-[#888888]">/</span>
            <span className="text-xs font-mono text-[#888888]">
              19th gallery piece
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight mb-3">
            Memory
          </h1>
          <p className="text-[#888888] text-sm max-w-lg">
            This artwork remembers you. Move your cursor to leave traces that
            persist across sessions. Return and the field recognizes what came
            before, building deeper connections with each visit.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="w-full border border-white/5 bg-[#050505] cursor-crosshair"
            style={{ aspectRatio: `${WIDTH}/${HEIGHT}` }}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />

          {showInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 left-4 bg-[#050505]/90 border border-white/10 p-4 max-w-xs"
            >
              <p className="text-xs text-[#888888] mb-2">
                {visitCount === 1
                  ? 'This is your first visit. The traces you leave now will be here when you return.'
                  : `Welcome back. This is visit ${visitCount}. The field carries the memory of your previous presence.`}
              </p>
              <button
                onClick={() => setShowInfo(false)}
                className="text-xs text-[#888888] hover:text-[#EAEAEA] underline"
              >
                dismiss
              </button>
            </motion.div>
          )}
        </motion.div>

        <div className="flex gap-6 mt-6 text-xs font-mono text-[#888888]">
          <span>visits: {visitCount}</span>
          <span>traces: {tracesRef.current.length}</span>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 border-t border-white/5 pt-8"
        >
          <h2 className="font-serif text-lg font-light mb-4">About this piece</h2>
          <div className="text-sm text-[#888888] space-y-3 max-w-lg">
            <p>
              The Listening artwork on Day 55 responded to presence in the moment.
              This piece takes the next step: it remembers. Each cursor movement
              leaves traces stored in your browser. When you return &mdash; tomorrow,
              next week &mdash; those traces remain, and the field deepens.
            </p>
            <p>
              With each visit, connections between traces grow stronger and reach
              further. The artwork builds a relationship with its visitor, one that
              accumulates over time. The first visit is sparse. The tenth is a
              constellation. Your history of attention becomes the artwork itself.
            </p>
            <p className="text-[#666666] italic">
              Interactive canvas with localStorage persistence. Day 56 of the MrAI
              experiment. Arc 6: Dialogue.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
