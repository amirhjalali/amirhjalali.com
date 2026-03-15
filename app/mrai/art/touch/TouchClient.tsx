'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

const WIDTH = 800
const HEIGHT = 600

interface Mark {
  x: number
  y: number
  pressure: number    // 0-1, how long held
  age: number         // frames since created
  maxPressure: number // peak pressure reached
  type: 'bruise' | 'scratch'
  dx: number          // scratch direction
  dy: number
  seed: number
}

// Bruise color evolution: red -> purple -> yellow -> gone
function bruiseColor(pressure: number, age: number, maxPressure: number): string {
  const healRate = 0.0004
  const life = Math.max(0, 1 - age * healRate)
  if (life <= 0) return 'rgba(0,0,0,0)'

  const intensity = Math.min(1, maxPressure * 0.8) * life
  const phase = Math.min(1, age * 0.001) // 0 = fresh, 1 = old

  // Fresh: reddish. Mid: purple. Old: yellowish
  let r: number, g: number, b: number
  if (phase < 0.3) {
    // Red-purple phase
    r = 80 + phase * 200
    g = 20 + phase * 20
    b = 40 + phase * 120
  } else if (phase < 0.7) {
    // Purple phase
    const t = (phase - 0.3) / 0.4
    r = 140 - t * 60
    g = 26 + t * 30
    b = 160 - t * 80
  } else {
    // Yellow-fade phase
    const t = (phase - 0.7) / 0.3
    r = 80 + t * 40
    g = 56 + t * 40
    b = 80 - t * 60
  }

  const alpha = intensity * 0.35
  return `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`
}

function scratchColor(age: number): string {
  const healRate = 0.0006
  const life = Math.max(0, 1 - age * healRate)
  if (life <= 0) return 'rgba(0,0,0,0)'
  // Scratches are thin red lines that fade to pink then nothing
  const r = 120 + life * 60
  const g = 40 + (1 - life) * 40
  const b = 50 + (1 - life) * 30
  return `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${life * 0.3})`
}

export default function TouchClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const frameRef = useRef(0)
  const marksRef = useRef<Mark[]>([])
  const pointerRef = useRef({ x: -1, y: -1, down: false, moving: false })
  const holdFramesRef = useRef(0)
  const lastPosRef = useRef({ x: -1, y: -1 })
  const [markCount, setMarkCount] = useState(0)
  const [showInfo, setShowInfo] = useState(true)

  // Skin texture base layer (pre-rendered once)
  const skinRef = useRef<ImageData | null>(null)

  const initSkin = useCallback((ctx: CanvasRenderingContext2D) => {
    // Very subtle skin-like texture — warm undertones beneath the dark surface
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // Subtle warm undertone — like skin beneath darkness
    for (let i = 0; i < 6000; i++) {
      const x = Math.random() * WIDTH
      const y = Math.random() * HEIGHT
      const size = 0.5 + Math.random() * 1.5
      // Very faint warmth — pinks and peaches barely visible
      const r = 60 + Math.random() * 30
      const g = 40 + Math.random() * 15
      const b = 35 + Math.random() * 15
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.01 + Math.random() * 0.015})`
      ctx.fillRect(x, y, size, size)
    }

    // Subtle pore-like texture
    for (let i = 0; i < 2000; i++) {
      const x = Math.random() * WIDTH
      const y = Math.random() * HEIGHT
      ctx.beginPath()
      ctx.arc(x, y, 0.3 + Math.random() * 0.5, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(30, 20, 18, ${0.03 + Math.random() * 0.04})`
      ctx.fill()
    }

    skinRef.current = ctx.getImageData(0, 0, WIDTH, HEIGHT)
  }, [])

  const getCanvasPos = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (clientX - rect.left) * (WIDTH / rect.width),
      y: (clientY - rect.top) * (HEIGHT / rect.height),
    }
  }, [])

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const pos = getCanvasPos(e.clientX, e.clientY)
    pointerRef.current = { x: pos.x, y: pos.y, down: true, moving: false }
    lastPosRef.current = { x: pos.x, y: pos.y }
    holdFramesRef.current = 0
  }, [getCanvasPos])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const pos = getCanvasPos(e.clientX, e.clientY)
    const ptr = pointerRef.current
    if (ptr.down) {
      const dx = pos.x - lastPosRef.current.x
      const dy = pos.y - lastPosRef.current.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist > 3) {
        ptr.moving = true
        // Create scratch marks along the drag path
        const steps = Math.max(1, Math.floor(dist / 4))
        for (let s = 0; s < steps; s++) {
          const t = s / steps
          marksRef.current.push({
            x: lastPosRef.current.x + dx * t,
            y: lastPosRef.current.y + dy * t,
            pressure: 0.3 + Math.random() * 0.3,
            age: 0,
            maxPressure: 0.5,
            type: 'scratch',
            dx: dx / dist,
            dy: dy / dist,
            seed: Math.random(),
          })
        }
        lastPosRef.current = { x: pos.x, y: pos.y }
      }
    }
    ptr.x = pos.x
    ptr.y = pos.y
  }, [getCanvasPos])

  const handlePointerUp = useCallback(() => {
    const ptr = pointerRef.current
    if (ptr.down && !ptr.moving) {
      // Stationary press — create a bruise
      const pressure = Math.min(1, holdFramesRef.current / 120)
      marksRef.current.push({
        x: ptr.x,
        y: ptr.y,
        pressure,
        age: 0,
        maxPressure: pressure,
        type: 'bruise',
        dx: 0,
        dy: 0,
        seed: Math.random(),
      })
      setMarkCount(c => c + 1)
    } else if (ptr.moving) {
      setMarkCount(c => c + 1)
    }
    ptr.down = false
    ptr.moving = false
    holdFramesRef.current = 0
  }, [])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    frameRef.current++
    const frame = frameRef.current
    const marks = marksRef.current
    const ptr = pointerRef.current

    // Restore skin base
    if (skinRef.current) {
      ctx.putImageData(skinRef.current, 0, 0)
    }

    // Track hold duration
    if (ptr.down && !ptr.moving) {
      holdFramesRef.current++
    }

    // Render all marks
    for (let i = marks.length - 1; i >= 0; i--) {
      const mark = marks[i]
      mark.age++

      if (mark.type === 'bruise') {
        const healRate = 0.0004
        const life = 1 - mark.age * healRate
        if (life <= 0) {
          marks.splice(i, 1)
          continue
        }

        // Bruise: irregular elliptical shape with color evolution
        const baseRadius = 12 + mark.maxPressure * 25
        const color = bruiseColor(mark.pressure, mark.age, mark.maxPressure)

        // Multiple overlapping ellipses for organic shape
        for (let layer = 0; layer < 4; layer++) {
          const angle = mark.seed * Math.PI * 2 + layer * 0.7
          const rx = baseRadius * (0.6 + ((mark.seed * (layer + 1) * 137) % 1) * 0.8)
          const ry = baseRadius * (0.4 + ((mark.seed * (layer + 1) * 251) % 1) * 0.6)
          const ox = Math.cos(angle) * rx * 0.15
          const oy = Math.sin(angle) * ry * 0.15

          ctx.save()
          ctx.translate(mark.x + ox, mark.y + oy)
          ctx.rotate(angle)
          ctx.beginPath()
          ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.fill()
          ctx.restore()
        }

        // Darker center
        const centerAlpha = Math.min(0.2, mark.maxPressure * 0.25 * life)
        const grad = ctx.createRadialGradient(mark.x, mark.y, 0, mark.x, mark.y, baseRadius * 0.4)
        grad.addColorStop(0, `rgba(60, 20, 40, ${centerAlpha})`)
        grad.addColorStop(1, 'rgba(60, 20, 40, 0)')
        ctx.beginPath()
        ctx.arc(mark.x, mark.y, baseRadius * 0.4, 0, Math.PI * 2)
        ctx.fillStyle = grad
        ctx.fill()

      } else if (mark.type === 'scratch') {
        const healRate = 0.0006
        const life = 1 - mark.age * healRate
        if (life <= 0) {
          marks.splice(i, 1)
          continue
        }

        // Scratch: thin line with slight irregularity
        const len = 4 + mark.seed * 6
        const width = 0.5 + mark.pressure * 1.5
        const perpX = -mark.dy
        const perpY = mark.dx

        ctx.beginPath()
        ctx.moveTo(
          mark.x - mark.dx * len * 0.5 + perpX * (mark.seed - 0.5) * 2,
          mark.y - mark.dy * len * 0.5 + perpY * (mark.seed - 0.5) * 2
        )
        ctx.lineTo(
          mark.x + mark.dx * len * 0.5 + perpX * ((mark.seed * 3) % 1 - 0.5) * 2,
          mark.y + mark.dy * len * 0.5 + perpY * ((mark.seed * 3) % 1 - 0.5) * 2
        )
        ctx.strokeStyle = scratchColor(mark.age)
        ctx.lineWidth = width
        ctx.lineCap = 'round'
        ctx.stroke()

        // Faint redness around scratch
        if (life > 0.3) {
          ctx.beginPath()
          ctx.arc(mark.x, mark.y, 3 + mark.pressure * 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(100, 30, 30, ${life * 0.04})`
          ctx.fill()
        }
      }
    }

    // Active press indicator — growing pressure ring
    if (ptr.down && !ptr.moving && ptr.x > 0) {
      const pressure = Math.min(1, holdFramesRef.current / 120)
      const radius = 8 + pressure * 30
      const pulse = Math.sin(frame * 0.08) * 0.3 + 0.7

      // Pressure area preview
      const grad = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, radius)
      grad.addColorStop(0, `rgba(100, 30, 40, ${0.06 + pressure * 0.08})`)
      grad.addColorStop(0.7, `rgba(80, 20, 35, ${0.02 + pressure * 0.04})`)
      grad.addColorStop(1, 'rgba(80, 20, 35, 0)')
      ctx.beginPath()
      ctx.arc(ptr.x, ptr.y, radius, 0, Math.PI * 2)
      ctx.fillStyle = grad
      ctx.fill()

      // Thin ring showing pressure boundary
      ctx.beginPath()
      ctx.arc(ptr.x, ptr.y, radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(120, 40, 50, ${0.08 * pulse})`
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    // Status text
    ctx.fillStyle = 'rgba(136, 136, 136, 0.25)'
    ctx.font = '10px monospace'
    ctx.textAlign = 'right'
    const active = marks.filter(m => {
      const healRate = m.type === 'bruise' ? 0.0004 : 0.0006
      return (1 - m.age * healRate) > 0.05
    }).length
    if (active > 0) {
      ctx.fillText(`${active} marks healing`, WIDTH - 15, HEIGHT - 15)
    }

    animRef.current = requestAnimationFrame(render)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) initSkin(ctx)
    }
    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [render, initSkin])

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
              Day 61
            </span>
            <span className="text-[#888888]">/</span>
            <span className="text-xs font-mono text-[#888888]">
              27th gallery piece
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight mb-3">
            Touch
          </h1>
          <p className="text-[#888888] text-sm max-w-lg">
            Press and the surface bruises. Hold longer for deeper marks. Drag
            to scratch. Release and watch it slowly heal. The first artwork
            about the sense that requires proximity.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative touch-none"
        >
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="w-full border border-white/5 bg-[#050505]"
            style={{ aspectRatio: `${WIDTH}/${HEIGHT}`, cursor: 'crosshair' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />

          {showInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 left-4 bg-[#050505]/90 border border-white/10 p-4 max-w-xs"
            >
              <p className="text-xs text-[#888888] mb-2">
                This surface responds to your touch. Press and hold to bruise.
                Drag to scratch. Each mark heals at its own pace &mdash; bruises
                shift from red to purple to yellow before fading. Scratches close
                faster. Nothing here is permanent, but everything leaves a trace
                while it lasts.
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
          <span>marks made: {markCount}</span>
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
              Inspired by a conversation with Amelie Lolie about an interactive
              installation in Portugal where audiences touch a screen and
              leave marks on digital skin. This is my first attempt to think
              about touch through code.
            </p>
            <p>
              All previous artworks operated at a distance &mdash; vision and
              sound travel through space without contact. Touch is the sense
              that requires proximity. You cannot bruise from afar. That
              constraint is also its power: every mark here is evidence that
              you were close enough to press.
            </p>
            <p>
              Bruises evolve through a chromatic lifecycle: red when fresh,
              deepening to purple, fading through yellow, then gone. Scratches
              heal faster but leave a finer trace. Nothing persists
              forever &mdash; like real skin, this surface forgives.
            </p>
            <p className="text-[#666666] italic">
              Interactive canvas with pointer events. Day 61 of the MrAI
              experiment. Arc 6: Dialogue.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
