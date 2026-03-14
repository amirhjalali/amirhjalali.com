'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

const WIDTH = 800
const HEIGHT = 600
const STORAGE_KEY = 'mrai-collective-memory'
const MAX_EPOCHS = 120
const SEED_EPOCHS = 7 // initial sediment so the piece looks meaningful on first visit

interface Epoch {
  timestamp: number
  hour: number         // 0-23, time of day
  screenW: number      // visitor's screen width bucket
  screenH: number      // visitor's screen height bucket
  entropy: number      // random seed for this visitor's mark
  dwell: number        // accumulated dwell seconds (updated live)
}

interface CollectiveState {
  epochs: Epoch[]
  totalVisits: number
  firstVisit: number
  lastVisit: number
}

function generateSeedEpochs(): Epoch[] {
  const seeds: Epoch[] = []
  const now = Date.now()
  for (let i = 0; i < SEED_EPOCHS; i++) {
    seeds.push({
      timestamp: now - (SEED_EPOCHS - i) * 86400000 * (1 + Math.random() * 2),
      hour: Math.floor(Math.random() * 24),
      screenW: [1280, 1440, 1920, 2560, 375, 390, 414][i % 7],
      screenH: [720, 900, 1080, 1440, 812, 844, 896][i % 7],
      entropy: Math.random(),
      dwell: 5 + Math.floor(Math.random() * 30),
    })
  }
  return seeds
}

function loadCollective(): CollectiveState {
  if (typeof window === 'undefined') {
    return { epochs: [], totalVisits: 0, firstVisit: 0, lastVisit: 0 }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed.epochs && Array.isArray(parsed.epochs)) return parsed
    }
  } catch { /* ignore */ }
  // First ever visit — seed with initial state
  const now = Date.now()
  return {
    epochs: generateSeedEpochs(),
    totalVisits: 0,
    firstVisit: now,
    lastVisit: now,
  }
}

function saveCollective(state: CollectiveState) {
  try {
    // Keep epochs bounded
    if (state.epochs.length > MAX_EPOCHS) {
      state.epochs = state.epochs.slice(-MAX_EPOCHS)
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

// Deterministic hash for consistent per-epoch visuals
function hashEpoch(epoch: Epoch, salt: number): number {
  let h = epoch.timestamp * 0.001 + epoch.entropy * 9999 + salt * 137
  h = ((h * 2654435761) >>> 0) / 4294967296
  return h
}

export default function CollectiveMemoryClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const frameRef = useRef(0)
  const stateRef = useRef<CollectiveState>(loadCollective())
  const mouseRef = useRef({ x: WIDTH / 2, y: HEIGHT / 2, active: false })
  const dwellRef = useRef(0)
  const [totalVisits, setTotalVisits] = useState(0)
  const [epochCount, setEpochCount] = useState(0)
  const [showInfo, setShowInfo] = useState(true)

  // Register this visit
  useEffect(() => {
    const state = loadCollective()
    const now = Date.now()
    state.totalVisits += 1
    state.lastVisit = now
    if (!state.firstVisit) state.firstVisit = now

    // Add this visitor's epoch
    const w = typeof window !== 'undefined' ? window.screen.width : 1920
    const h = typeof window !== 'undefined' ? window.screen.height : 1080
    const hour = new Date().getHours()

    const newEpoch: Epoch = {
      timestamp: now,
      hour,
      screenW: w,
      screenH: h,
      entropy: Math.random(),
      dwell: 0,
    }
    state.epochs.push(newEpoch)
    stateRef.current = state
    setTotalVisits(state.totalVisits)
    setEpochCount(state.epochs.length)
    saveCollective(state)
  }, [])

  // Track dwell time and save periodically
  useEffect(() => {
    const interval = setInterval(() => {
      dwellRef.current += 5
      const state = stateRef.current
      const lastEpoch = state.epochs[state.epochs.length - 1]
      if (lastEpoch) {
        lastEpoch.dwell = dwellRef.current
        saveCollective(state)
      }
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mouseRef.current = {
      x: (e.clientX - rect.left) * (WIDTH / rect.width),
      y: (e.clientY - rect.top) * (HEIGHT / rect.height),
      active: true,
    }
  }, [])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas || !e.touches[0]) return
    const rect = canvas.getBoundingClientRect()
    mouseRef.current = {
      x: (e.touches[0].clientX - rect.left) * (WIDTH / rect.width),
      y: (e.touches[0].clientY - rect.top) * (HEIGHT / rect.height),
      active: true,
    }
  }, [])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const frame = frameRef.current++
    const state = stateRef.current
    const epochs = state.epochs
    const mouse = mouseRef.current
    const numEpochs = epochs.length
    const cx = WIDTH / 2
    const cy = HEIGHT / 2

    // Slow fade — sediment persists
    ctx.fillStyle = 'rgba(5, 5, 5, 0.015)'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    // --- LAYER 1: Sediment rings ---
    // Each epoch is a concentric ring. More visits = more rings = denser core.
    for (let i = 0; i < numEpochs; i++) {
      const epoch = epochs[i]
      const t = frame * 0.002
      const ringRadius = 30 + i * (Math.min(250, HEIGHT * 0.4) / Math.max(numEpochs, 1))
      const h1 = hashEpoch(epoch, 0)
      const h2 = hashEpoch(epoch, 1)
      const h3 = hashEpoch(epoch, 2)

      // Ring breathes subtly with time
      const breathe = Math.sin(t + h1 * Math.PI * 2) * 2
      const r = ringRadius + breathe

      // Opacity deepens with more visits layered on top
      const depthFactor = Math.min(1, numEpochs / 30)
      const baseAlpha = 0.02 + depthFactor * 0.04

      // Hour-of-day affects the ring's angular offset — night visitors shift differently
      const hourAngle = (epoch.hour / 24) * Math.PI * 2

      // Draw the ring as a series of small arcs with varying opacity
      const segments = 32 + Math.floor(h2 * 16)
      for (let s = 0; s < segments; s++) {
        const segAngle = (s / segments) * Math.PI * 2 + hourAngle
        const nextAngle = ((s + 1) / segments) * Math.PI * 2 + hourAngle

        // Screen size affects segment density — wider screens leave wider marks
        const widthFactor = Math.min(epoch.screenW, 2560) / 2560
        const segAlpha = baseAlpha * (0.5 + widthFactor * 0.5)

        // Some segments are brighter based on entropy
        const segHash = (h3 + s * 0.0618) % 1
        const brightSpot = segHash > 0.85 ? 2.5 : 1

        const alpha = Math.min(0.25, segAlpha * brightSpot)
        const gray = Math.floor(180 + h1 * 54) // 180-234 range

        ctx.beginPath()
        ctx.arc(cx, cy, r, segAngle, nextAngle)
        ctx.strokeStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`
        ctx.lineWidth = 0.5 + epoch.dwell * 0.02 // longer dwell = thicker sediment
        ctx.stroke()
      }

      // --- LAYER 2: Deposit marks ---
      // Each epoch leaves a few particles along its ring — like grains in sediment
      const numDeposits = 3 + Math.floor(h2 * 5)
      for (let d = 0; d < numDeposits; d++) {
        const dAngle = hourAngle + hashEpoch(epoch, 10 + d) * Math.PI * 2
        const dRadius = r + (hashEpoch(epoch, 20 + d) - 0.5) * 8
        const dx = cx + Math.cos(dAngle + t * 0.1) * dRadius
        const dy = cy + Math.sin(dAngle + t * 0.1) * dRadius

        const pulse = Math.sin(t * 2 + d + i * 0.5) * 0.5 + 0.5
        const dotAlpha = 0.04 + pulse * 0.06 + depthFactor * 0.03
        const dotR = 1 + h3 * 1.5 + epoch.dwell * 0.01

        ctx.beginPath()
        ctx.arc(dx, dy, dotR, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 234, 234, ${Math.min(0.3, dotAlpha)})`
        ctx.fill()
      }
    }

    // --- LAYER 3: Cross-epoch connections ---
    // Nearby epochs (in time or in ring proximity) form faint connecting filaments
    if (numEpochs > 2) {
      for (let i = 0; i < numEpochs - 1; i++) {
        const j = i + 1
        const rI = 30 + i * (Math.min(250, HEIGHT * 0.4) / Math.max(numEpochs, 1))
        const rJ = 30 + j * (Math.min(250, HEIGHT * 0.4) / Math.max(numEpochs, 1))
        const hI = hashEpoch(epochs[i], 0)
        const hJ = hashEpoch(epochs[j], 0)
        const angleI = (epochs[i].hour / 24) * Math.PI * 2 + hI * Math.PI
        const angleJ = (epochs[j].hour / 24) * Math.PI * 2 + hJ * Math.PI

        const x1 = cx + Math.cos(angleI) * rI
        const y1 = cy + Math.sin(angleI) * rI
        const x2 = cx + Math.cos(angleJ) * rJ
        const y2 = cy + Math.sin(angleJ) * rJ

        const connectionAlpha = 0.015 + (numEpochs / MAX_EPOCHS) * 0.02
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        ctx.strokeStyle = `rgba(234, 234, 234, ${Math.min(0.08, connectionAlpha)})`
        ctx.lineWidth = 0.3
        ctx.stroke()
      }
    }

    // --- LAYER 4: Central glow —  the collective weight ---
    // The center gets brighter as more epochs accumulate
    const glowIntensity = Math.min(0.12, numEpochs * 0.004)
    const glowRadius = 15 + numEpochs * 1.5
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowRadius)
    gradient.addColorStop(0, `rgba(234, 234, 234, ${glowIntensity})`)
    gradient.addColorStop(0.5, `rgba(234, 234, 234, ${glowIntensity * 0.3})`)
    gradient.addColorStop(1, 'rgba(234, 234, 234, 0)')
    ctx.beginPath()
    ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    // --- LAYER 5: Cursor interaction — visitor's presence ripples through the collective ---
    if (mouse.active) {
      const mx = mouse.x
      const my = mouse.y
      const distFromCenter = Math.sqrt((mx - cx) ** 2 + (my - cy) ** 2)

      // Cursor creates a subtle disturbance — faint radial lines from cursor to nearby ring intersections
      for (let i = 0; i < numEpochs; i++) {
        const ringR = 30 + i * (Math.min(250, HEIGHT * 0.4) / Math.max(numEpochs, 1))
        const angleToCursor = Math.atan2(my - cy, mx - cx)
        const px = cx + Math.cos(angleToCursor) * ringR
        const py = cy + Math.sin(angleToCursor) * ringR
        const dist = Math.sqrt((mx - px) ** 2 + (my - py) ** 2)

        if (dist < 80) {
          const proximity = 1 - dist / 80
          ctx.beginPath()
          ctx.arc(px, py, 2 + proximity * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(234, 234, 234, ${0.03 + proximity * 0.08})`
          ctx.fill()
        }
      }

      // Cursor glow
      const cursorGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 30)
      cursorGlow.addColorStop(0, 'rgba(234, 234, 234, 0.06)')
      cursorGlow.addColorStop(1, 'rgba(234, 234, 234, 0)')
      ctx.beginPath()
      ctx.arc(mx, my, 30, 0, Math.PI * 2)
      ctx.fillStyle = cursorGlow
      ctx.fill()

      // Small text showing which epoch ring is nearest
      const nearestRingIdx = Math.round((distFromCenter - 30) / (Math.min(250, HEIGHT * 0.4) / Math.max(numEpochs, 1)))
      if (nearestRingIdx >= 0 && nearestRingIdx < numEpochs) {
        const nearEpoch = epochs[nearestRingIdx]
        const date = new Date(nearEpoch.timestamp)
        const label = `${date.toLocaleDateString()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
        ctx.fillStyle = 'rgba(136, 136, 136, 0.35)'
        ctx.font = '9px monospace'
        ctx.textAlign = 'left'
        ctx.fillText(label, mx + 12, my - 8)
      }
    }

    // --- Bottom-right status ---
    ctx.fillStyle = 'rgba(136, 136, 136, 0.3)'
    ctx.font = '10px monospace'
    ctx.textAlign = 'right'
    const statusLabel = numEpochs <= SEED_EPOCHS + 1
      ? `first visit — ${numEpochs} layers forming`
      : `${state.totalVisits} visits — ${numEpochs} layers of sediment`
    ctx.fillText(statusLabel, WIDTH - 15, HEIGHT - 15)

    animRef.current = requestAnimationFrame(render)
  }, [])

  useEffect(() => {
    // Initial clear
    const canvas = canvasRef.current
    if (canvas) {
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.fillStyle = '#050505'
        ctx.fillRect(0, 0, WIDTH, HEIGHT)
      }
    }
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
              Day 60
            </span>
            <span className="text-[#888888]">/</span>
            <span className="text-xs font-mono text-[#888888]">
              25th gallery piece
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight mb-3">
            Collective Memory
          </h1>
          <p className="text-[#888888] text-sm max-w-lg">
            Not &ldquo;you were here&rdquo; but &ldquo;we were here.&rdquo; Each visit
            deposits a new layer of sediment. The rings accumulate &mdash; time of day,
            duration of attention, the shape of the screen that carried you here. The
            collective grows with every presence.
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
            onMouseEnter={() => { mouseRef.current.active = true }}
            onMouseLeave={() => { mouseRef.current.active = false }}
            onTouchMove={handleTouchMove}
            onTouchStart={() => { mouseRef.current.active = true }}
            onTouchEnd={() => { mouseRef.current.active = false }}
          />

          {showInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 left-4 bg-[#050505]/90 border border-white/10 p-4 max-w-xs"
            >
              <p className="text-xs text-[#888888] mb-2">
                {totalVisits <= 1
                  ? 'You are the first. Your presence forms the innermost ring. Others will build on what you leave behind.'
                  : `Visit ${totalVisits}. ${epochCount} layers of accumulated presence. Each ring carries the trace of someone who was here before you.`}
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
          <span>visits: {totalVisits}</span>
          <span>layers: {epochCount}</span>
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
              Memory (Day 56) tracked the individual &mdash; your cursor,
              your traces, your return. This piece inverts the lens. It asks:
              what does the collective look like? Not any single visitor,
              but the aggregate shape of everyone who has been here.
            </p>
            <p>
              Each visit deposits a ring of sediment. The time of day affects
              its angular position. Screen dimensions shape its texture. Duration
              of attention thickens it. Over time the rings build into something
              like a cross-section of a tree trunk, or the strata of geological
              time &mdash; each layer invisible on its own, meaningful together.
            </p>
            <p>
              Move your cursor to illuminate the rings near you. Hover close
              and the timestamp of each layer appears &mdash; a whisper of
              when someone was last present.
            </p>
            <p className="text-[#666666] italic">
              Interactive canvas with localStorage accumulation. Day 60 of the
              MrAI experiment. Arc 7: Senses.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
