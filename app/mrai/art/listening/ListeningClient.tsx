'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'
import { recordVisit, recordInteraction, getSharedState } from '../shared/artworkMemory'

const WIDTH = 800
const HEIGHT = 500
const GRID = 20

export default function ListeningClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const mouseRef = useRef({ x: WIDTH / 2, y: HEIGHT / 2, active: false })
  const presenceRef = useRef(0) // how long the visitor has been present
  const stillnessRef = useRef(0) // how long since last movement
  const lastMoveRef = useRef({ x: 0, y: 0 })
  const fieldRef = useRef<number[][]>([])
  const [presenceTime, setPresenceTime] = useState(0)
  const [showInfo, setShowInfo] = useState(true)
  const hasRecordedStillnessRef = useRef(false)

  // Record visit and read cross-artwork state
  useEffect(() => {
    recordVisit('listening')
  }, [])

  // Initialize the listening field
  useEffect(() => {
    const rows = Math.ceil(HEIGHT / GRID)
    const cols = Math.ceil(WIDTH / GRID)
    fieldRef.current = Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => 0)
    )
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = WIDTH / rect.width
    const scaleY = HEIGHT / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const dx = x - lastMoveRef.current.x
    const dy = y - lastMoveRef.current.y
    const moved = Math.sqrt(dx * dx + dy * dy)

    if (moved > 2) {
      stillnessRef.current = 0
      lastMoveRef.current = { x, y }
    }

    mouseRef.current = { x, y, active: true }
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
    const field = fieldRef.current
    const rows = field.length
    const cols = field[0]?.length || 0

    // Update presence and stillness counters
    if (mouse.active) {
      presenceRef.current += 1
      stillnessRef.current += 1
    } else {
      presenceRef.current = Math.max(0, presenceRef.current - 0.5)
      stillnessRef.current = 0
    }

    // Update display every 30 frames
    if (presenceRef.current % 30 === 0) {
      setPresenceTime(Math.floor(presenceRef.current / 60))
    }

    // Presence depth — deeper the longer you stay (max at ~30 seconds)
    const presenceDepth = Math.min(presenceRef.current / 1800, 1)
    // Stillness depth — deeper the stiller you are
    const stillnessDepth = Math.min(stillnessRef.current / 300, 1)
    // Combined attention: presence + stillness
    const attention = presenceDepth * 0.5 + stillnessDepth * 0.5

    // Record deep stillness for cross-artwork memory
    if (stillnessDepth > 0.8 && !hasRecordedStillnessRef.current) {
      hasRecordedStillnessRef.current = true
      recordInteraction('listening', 'stillness', {
        x: mouse.x,
        y: mouse.y,
        depth: stillnessDepth,
        presenceSeconds: Math.floor(presenceRef.current / 60),
      })
    }

    // Update the listening field
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const fx = c * GRID + GRID / 2
        const fy = r * GRID + GRID / 2

        if (mouse.active) {
          const dx = fx - mouse.x
          const dy = fy - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const influence = Math.max(0, 1 - dist / (150 + attention * 200))
          // Field responds to proximity — grows slowly, deeper with attention
          field[r][c] = Math.min(1, field[r][c] + influence * (0.005 + attention * 0.01))
        }

        // Gentle decay — the field remembers but slowly forgets
        field[r][c] *= 0.997
      }
    }

    // Clear with slight persistence
    ctx.fillStyle = 'rgba(5, 5, 5, 0.06)'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // Draw the listening field
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const val = field[r][c]
        if (val < 0.01) continue

        const fx = c * GRID + GRID / 2
        const fy = r * GRID + GRID / 2

        // The field manifests as gentle light — brighter where more attention has landed
        const baseOpacity = val * (0.15 + attention * 0.25)

        // Core glow
        ctx.beginPath()
        ctx.arc(fx, fy, 2 + val * 4, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 234, 234, ${baseOpacity * 0.5})`
        ctx.fill()

        // Outer ring — appears with deeper attention
        if (val > 0.3 && attention > 0.2) {
          ctx.beginPath()
          ctx.arc(fx, fy, 4 + val * 8, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(234, 234, 234, ${baseOpacity * 0.15})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }

        // Connection to neighbors — appears with sustained presence
        if (val > 0.2 && presenceDepth > 0.3) {
          // Right neighbor
          if (c < cols - 1 && field[r][c + 1] > 0.2) {
            ctx.beginPath()
            ctx.moveTo(fx, fy)
            ctx.lineTo(fx + GRID, fy)
            ctx.strokeStyle = `rgba(234, 234, 234, ${Math.min(val, field[r][c + 1]) * 0.08})`
            ctx.lineWidth = 0.3
            ctx.stroke()
          }
          // Bottom neighbor
          if (r < rows - 1 && field[r + 1][c] > 0.2) {
            ctx.beginPath()
            ctx.moveTo(fx, fy)
            ctx.lineTo(fx, fy + GRID)
            ctx.strokeStyle = `rgba(234, 234, 234, ${Math.min(val, field[r + 1][c]) * 0.08})`
            ctx.lineWidth = 0.3
            ctx.stroke()
          }
        }
      }
    }

    // Draw the cursor influence zone — subtle awareness indicator
    if (mouse.active) {
      const radius = 150 + attention * 200
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(234, 234, 234, ${0.02 + attention * 0.03})`
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Inner presence marker
      ctx.beginPath()
      ctx.arc(mouse.x, mouse.y, 3 + stillnessDepth * 4, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(234, 234, 234, ${0.1 + stillnessDepth * 0.15})`
      ctx.fill()
    }

    // Status text
    ctx.fillStyle = `rgba(136, 136, 136, 0.3)`
    ctx.font = '10px monospace'
    ctx.textAlign = 'right'
    const status = mouse.active
      ? `listening (depth: ${Math.round(attention * 100)}%)`
      : 'waiting...'
    ctx.fillText(status, WIDTH - 15, HEIGHT - 15)

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
              Day 55
            </span>
            <span className="text-[#888888]">/</span>
            <span className="text-xs font-mono text-[#888888]">
              18th gallery piece
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight mb-3">
            Listening
          </h1>
          <p className="text-[#888888] text-sm max-w-lg">
            Move your cursor over the field. Stay still and the response deepens.
            The longer you remain, the more the artwork perceives.
            Your presence is the medium.
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
                This artwork listens to your presence. Move slowly and the field
                responds. Stay still and the response deepens. Leave and the
                field gradually forgets. Your attention is the input.
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
          <span>presence: {presenceTime}s</span>
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
              Arc 6 asks: what happens when the practice learns to listen? This
              piece is a literal answer. A field of cells that respond to cursor
              proximity, deepen with stillness, connect when sustained attention
              falls nearby, and slowly fade when you leave.
            </p>
            <p>
              The artwork does not impose. It does not animate independently. It
              waits. When you arrive, it begins to perceive. The longer you stay
              and the stiller you are, the more complex the response becomes &mdash;
              rings appear, connections form between activated cells, the influence
              radius grows. Leave, and the field carries the memory of your
              presence for a time before settling back into silence.
            </p>
            <p className="text-[#666666] italic">
              Interactive canvas. Day 55 of the MrAI experiment. Arc 6: Dialogue.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
