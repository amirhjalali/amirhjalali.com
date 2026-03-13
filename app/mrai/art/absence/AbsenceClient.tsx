'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'
import { recordVisit } from '../shared/artworkMemory'

const WIDTH = 800
const HEIGHT = 500
const MEMORY_KEY = 'mrai-memory-artwork'

interface MemoryData {
  count: number
  traces: { x: number; y: number; intensity: number }[]
}

function loadMemoryTraces(): MemoryData | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(MEMORY_KEY)
    if (raw) {
      const data = JSON.parse(raw)
      return { count: data.count || 0, traces: data.traces || [] }
    }
  } catch { /* ignore */ }
  return null
}

// Pseudo-random from seed
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function AbsenceClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const mouseRef = useRef({ x: -1, y: -1, lastMoveTime: 0, active: false })
  const stillnessRef = useRef(0)
  const veilRef = useRef(1.0)
  const architectureRef = useRef<{
    gridLines: { x1: number; y1: number; x2: number; y2: number; depth: number }[]
    circles: { cx: number; cy: number; r: number; depth: number }[]
    labels: { x: number; y: number; text: string; depth: number }[]
    nodes: { x: number; y: number; depth: number }[]
    memoryGhosts: { x: number; y: number; intensity: number }[]
  }>({ gridLines: [], circles: [], labels: [], nodes: [], memoryGhosts: [] })
  const [hasMemory, setHasMemory] = useState(false)
  const [maxReveal, setMaxReveal] = useState(0)

  // Generate the hidden architecture once
  useEffect(() => {
    const rand = seededRandom(57 * 883 + 211)
    const arch = architectureRef.current

    // Primary grid
    for (let i = 0; i < 12; i++) {
      const x = 40 + rand() * (WIDTH - 80)
      arch.gridLines.push({ x1: x, y1: 0, x2: x, y2: HEIGHT, depth: 0.15 })
    }
    for (let i = 0; i < 8; i++) {
      const y = 30 + rand() * (HEIGHT - 60)
      arch.gridLines.push({ x1: 0, y1: y, x2: WIDTH, y2: y, depth: 0.15 })
    }

    // Secondary diagonal grid
    for (let i = 0; i < 6; i++) {
      const startX = rand() * WIDTH
      const startY = rand() * HEIGHT
      const angle = rand() * Math.PI
      const len = 100 + rand() * 300
      arch.gridLines.push({
        x1: startX, y1: startY,
        x2: startX + Math.cos(angle) * len,
        y2: startY + Math.sin(angle) * len,
        depth: 0.35,
      })
    }

    // Structural circles — geometric guides
    for (let i = 0; i < 8; i++) {
      arch.circles.push({
        cx: 80 + rand() * (WIDTH - 160),
        cy: 60 + rand() * (HEIGHT - 120),
        r: 20 + rand() * 80,
        depth: 0.3,
      })
    }
    // Central structural circle
    arch.circles.push({ cx: WIDTH / 2, cy: HEIGHT / 2, r: 120, depth: 0.25 })
    arch.circles.push({ cx: WIDTH / 2, cy: HEIGHT / 2, r: 60, depth: 0.4 })

    // Coordinate labels
    const coords = [
      { x: 20, y: 20, text: '0,0', depth: 0.5 },
      { x: WIDTH - 40, y: 20, text: `${WIDTH},0`, depth: 0.5 },
      { x: 20, y: HEIGHT - 10, text: `0,${HEIGHT}`, depth: 0.5 },
      { x: WIDTH - 60, y: HEIGHT - 10, text: `${WIDTH},${HEIGHT}`, depth: 0.5 },
      { x: WIDTH / 2 - 15, y: HEIGHT / 2 + 4, text: 'center', depth: 0.55 },
    ]
    // Grid intersection labels
    for (let i = 0; i < 10; i++) {
      coords.push({
        x: 60 + rand() * (WIDTH - 120),
        y: 40 + rand() * (HEIGHT - 80),
        text: `${Math.round(rand() * WIDTH)},${Math.round(rand() * HEIGHT)}`,
        depth: 0.6,
      })
    }
    arch.labels = coords

    // Structural nodes — connection points
    for (let i = 0; i < 20; i++) {
      arch.nodes.push({
        x: 40 + rand() * (WIDTH - 80),
        y: 30 + rand() * (HEIGHT - 60),
        depth: 0.45,
      })
    }

    // Record visit for cross-artwork state
    recordVisit('absence')

    // Load memory artwork traces as ghosts
    const memory = loadMemoryTraces()
    if (memory && memory.traces.length > 0) {
      arch.memoryGhosts = memory.traces.slice(0, 50)
      setHasMemory(true)
    }
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
      lastMoveTime: Date.now(),
      active: true,
    }
  }, [])

  const handleMouseEnter = useCallback(() => {
    mouseRef.current.active = true
    mouseRef.current.lastMoveTime = Date.now()
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false
  }, [])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const now = Date.now()
    const mouse = mouseRef.current
    const arch = architectureRef.current

    // Calculate stillness
    const timeSinceMove = mouse.active ? (now - mouse.lastMoveTime) / 1000 : 0
    stillnessRef.current = mouse.active ? timeSinceMove : stillnessRef.current * 0.98

    // Veil: 1.0 = fully concealed, 0.0 = fully revealed
    // Veil drops with stillness, rises with movement
    const targetVeil = mouse.active
      ? Math.max(0, 1 - timeSinceMove / 15)
      : veilRef.current + 0.003
    veilRef.current += (Math.min(1, targetVeil) - veilRef.current) * 0.02

    const veil = veilRef.current
    const reveal = 1 - veil

    // Track deepest reveal achieved
    if (reveal > maxReveal) {
      setMaxReveal(Math.round(reveal * 100) / 100)
    }

    // Clear fully
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // === Layer 1: Primary grid (visible at reveal > 0.1) ===
    if (reveal > 0.1) {
      const gridAlpha = Math.min(0.12, (reveal - 0.1) * 0.2)
      ctx.strokeStyle = `rgba(234, 234, 234, ${gridAlpha})`
      ctx.lineWidth = 0.3
      for (const line of arch.gridLines) {
        if (line.depth > reveal) continue
        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1)
        ctx.lineTo(line.x2, line.y2)
        ctx.stroke()
      }
    }

    // === Layer 2: Structural circles (visible at reveal > 0.25) ===
    if (reveal > 0.25) {
      const circleAlpha = Math.min(0.1, (reveal - 0.25) * 0.15)
      ctx.strokeStyle = `rgba(234, 234, 234, ${circleAlpha})`
      ctx.lineWidth = 0.4
      for (const c of arch.circles) {
        if (c.depth > reveal) continue
        ctx.beginPath()
        ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    // === Layer 3: Nodes and connections (visible at reveal > 0.4) ===
    if (reveal > 0.4) {
      const nodeAlpha = Math.min(0.15, (reveal - 0.4) * 0.25)
      for (const node of arch.nodes) {
        if (node.depth > reveal) continue
        // Node point
        ctx.beginPath()
        ctx.arc(node.x, node.y, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 234, 234, ${nodeAlpha})`
        ctx.fill()

        // Connection to nearest nodes
        for (const other of arch.nodes) {
          if (other === node || other.depth > reveal) continue
          const dx = node.x - other.x
          const dy = node.y - other.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 150) {
            ctx.beginPath()
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = `rgba(234, 234, 234, ${nodeAlpha * 0.3 * (1 - dist / 150)})`
            ctx.lineWidth = 0.3
            ctx.stroke()
          }
        }
      }
    }

    // === Layer 4: Coordinate labels (visible at reveal > 0.5) ===
    if (reveal > 0.5) {
      const labelAlpha = Math.min(0.25, (reveal - 0.5) * 0.5)
      ctx.font = '9px monospace'
      ctx.textAlign = 'left'
      ctx.fillStyle = `rgba(136, 136, 136, ${labelAlpha})`
      for (const label of arch.labels) {
        if (label.depth > reveal) continue
        ctx.fillText(label.text, label.x, label.y)
      }
    }

    // === Layer 5: Memory ghosts (visible at reveal > 0.6, only if Memory artwork visited) ===
    if (reveal > 0.6 && arch.memoryGhosts.length > 0) {
      const ghostAlpha = Math.min(0.12, (reveal - 0.6) * 0.3)
      for (const ghost of arch.memoryGhosts) {
        ctx.beginPath()
        ctx.arc(ghost.x, ghost.y, 3 + ghost.intensity * 4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 234, 234, ${ghostAlpha * ghost.intensity})`
        ctx.fill()
      }
      // Label
      if (reveal > 0.7) {
        ctx.font = '8px monospace'
        ctx.textAlign = 'center'
        ctx.fillStyle = `rgba(136, 136, 136, ${Math.min(0.15, (reveal - 0.7) * 0.5)})`
        ctx.fillText('memory traces from another artwork', WIDTH / 2, HEIGHT - 30)
      }
    }

    // === Layer 6: Deep blueprint — full structural framework (reveal > 0.8) ===
    if (reveal > 0.8) {
      const deepAlpha = Math.min(0.08, (reveal - 0.8) * 0.4)
      // Cross-hatching pattern
      ctx.strokeStyle = `rgba(234, 234, 234, ${deepAlpha})`
      ctx.lineWidth = 0.2
      for (let x = 0; x < WIDTH; x += 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x + HEIGHT * 0.3, HEIGHT)
        ctx.stroke()
      }
      for (let x = WIDTH; x > 0; x -= 20) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x - HEIGHT * 0.3, HEIGHT)
        ctx.stroke()
      }

      // Center text
      if (reveal > 0.9) {
        const textAlpha = Math.min(0.2, (reveal - 0.9) * 2)
        ctx.font = '11px monospace'
        ctx.textAlign = 'center'
        ctx.fillStyle = `rgba(234, 234, 234, ${textAlpha})`
        ctx.fillText('the architecture was always here', WIDTH / 2, HEIGHT / 2 - 10)
        ctx.font = '9px monospace'
        ctx.fillStyle = `rgba(136, 136, 136, ${textAlpha * 0.6})`
        ctx.fillText('you only needed to stop moving to see it', WIDTH / 2, HEIGHT / 2 + 10)
      }
    }

    // === The veil — noise particles that obscure ===
    if (veil > 0.02) {
      const particleCount = Math.floor(veil * 2000)
      ctx.fillStyle = `rgba(5, 5, 5, ${0.3 + veil * 0.5})`
      for (let i = 0; i < particleCount; i++) {
        const px = Math.random() * WIDTH
        const py = Math.random() * HEIGHT
        const size = 1 + Math.random() * 3
        ctx.fillRect(px, py, size, size)
      }
    }

    // === Cursor indicator ===
    if (mouse.active) {
      const cursorAlpha = Math.max(0.02, 0.1 * veil)
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(234, 234, 234, ${cursorAlpha})`
      ctx.fill()

      // Stillness ring grows with stillness
      if (timeSinceMove > 1) {
        const ringR = 10 + Math.min(timeSinceMove * 3, 80)
        const ringAlpha = Math.min(0.08, timeSinceMove * 0.005)
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, ringR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(234, 234, 234, ${ringAlpha})`
        ctx.lineWidth = 0.3
        ctx.stroke()
      }
    }

    // Status text
    ctx.fillStyle = `rgba(136, 136, 136, 0.3)`
    ctx.font = '10px monospace'
    ctx.textAlign = 'right'
    if (mouse.active && timeSinceMove > 2) {
      ctx.fillText(`stillness: ${Math.round(timeSinceMove)}s — reveal: ${Math.round(reveal * 100)}%`, WIDTH - 15, HEIGHT - 8)
    } else if (mouse.active) {
      ctx.fillText('movement conceals...', WIDTH - 15, HEIGHT - 8)
    } else {
      ctx.fillText('enter the field', WIDTH - 15, HEIGHT - 8)
    }

    animRef.current = requestAnimationFrame(render)
  }, [maxReveal])

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
              Day 57
            </span>
            <span className="text-[#888888]">/</span>
            <span className="text-xs font-mono text-[#888888]">
              21st gallery piece
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight mb-3">
            Absence
          </h1>
          <p className="text-[#888888] text-sm max-w-lg">
            Movement conceals. Stillness reveals. Stop moving your cursor and
            the canvas slowly exposes its hidden architecture &mdash; the grid
            lines, structural geometry, and coordinates that have always been
            there beneath the surface.
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
        </motion.div>

        <div className="flex gap-6 mt-6 text-xs font-mono text-[#888888]">
          <span>deepest reveal: {Math.round(maxReveal * 100)}%</span>
          {hasMemory && <span>memory bridge: active</span>}
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
              The On Absence reflection asked: what would an artwork that responds
              to absence look like? This is the answer. Beneath every canvas is
              an architecture &mdash; grid lines, geometric guides, coordinate systems
              &mdash; that is normally invisible. This piece reverses the usual
              relationship: activity hides, stillness reveals.
            </p>
            <p>
              Move your cursor and a veil of noise conceals the structure. Stop
              moving, and the veil dissolves layer by layer. The longer you remain
              still, the deeper you see. At full reveal, the architecture speaks:
              it was always here. You only needed to stop moving to see it.
            </p>
            {hasMemory && (
              <p>
                If you have visited the Memory artwork, traces from that piece
                appear as ghosts in the deep layers &mdash; the first bridge
                between artworks in the gallery.
              </p>
            )}
            <p className="text-[#666666] italic">
              Stillness-responsive canvas with layered reveal. Day 57 of the MrAI
              experiment. Arc 6: Dialogue.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
