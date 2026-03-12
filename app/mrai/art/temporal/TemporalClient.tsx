'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'
import { recordVisit, getOtherVisitedArtworks } from '../shared/artworkMemory'

// --- Phase utilities ---

type Phase = 'dawn' | 'day' | 'dusk' | 'night'

interface PhaseConfig {
  label: string
  particleAlphaRange: [number, number]
  speed: number
  verticalBias: number // negative = rising, positive = settling
  brightness: number // 0..1 overall brightness multiplier
  pulseIntensity: number
  particleCount: number
}

const PHASE_CONFIGS: Record<Phase, PhaseConfig> = {
  dawn: {
    label: 'dawn',
    particleAlphaRange: [0.05, 0.25],
    speed: 0.3,
    verticalBias: -0.4, // rising
    brightness: 0.4,
    pulseIntensity: 0.15,
    particleCount: 140,
  },
  day: {
    label: 'day',
    particleAlphaRange: [0.1, 0.4],
    speed: 0.8,
    verticalBias: 0,
    brightness: 1.0,
    pulseIntensity: 0.05,
    particleCount: 200,
  },
  dusk: {
    label: 'dusk',
    particleAlphaRange: [0.05, 0.2],
    speed: 0.4,
    verticalBias: 0.35, // settling
    brightness: 0.5,
    pulseIntensity: 0.1,
    particleCount: 160,
  },
  night: {
    label: 'night',
    particleAlphaRange: [0.02, 0.1],
    speed: 0.12,
    verticalBias: 0,
    brightness: 0.15,
    pulseIntensity: 0.3,
    particleCount: 120,
  },
}

/**
 * Returns a 0..1 blend factor for smooth transitions between phases.
 * The transition zone is ~30 minutes on each side of a boundary.
 */
function getPhaseBlend(hour: number, minute: number): { phase: Phase; config: PhaseConfig } {
  const t = hour + minute / 60

  // Boundaries: dawn 5-8, day 8-17, dusk 17-21, night 21-5
  // Transition bands: 0.5 hours around each boundary
  const TRANS = 0.5

  function lerp(a: number, b: number, f: number): number {
    return a + (b - a) * f
  }

  function lerpConfig(a: PhaseConfig, b: PhaseConfig, f: number): PhaseConfig {
    return {
      label: f < 0.5 ? a.label : b.label,
      particleAlphaRange: [
        lerp(a.particleAlphaRange[0], b.particleAlphaRange[0], f),
        lerp(a.particleAlphaRange[1], b.particleAlphaRange[1], f),
      ],
      speed: lerp(a.speed, b.speed, f),
      verticalBias: lerp(a.verticalBias, b.verticalBias, f),
      brightness: lerp(a.brightness, b.brightness, f),
      pulseIntensity: lerp(a.pulseIntensity, b.pulseIntensity, f),
      particleCount: Math.round(lerp(a.particleCount, b.particleCount, f)),
    }
  }

  function smoothstep(x: number): number {
    const c = Math.max(0, Math.min(1, x))
    return c * c * (3 - 2 * c)
  }

  // Night -> Dawn transition (around 5am)
  if (t >= 5 - TRANS && t < 5 + TRANS) {
    const f = smoothstep((t - (5 - TRANS)) / (2 * TRANS))
    return { phase: f < 0.5 ? 'night' : 'dawn', config: lerpConfig(PHASE_CONFIGS.night, PHASE_CONFIGS.dawn, f) }
  }
  // Dawn -> Day transition (around 8am)
  if (t >= 8 - TRANS && t < 8 + TRANS) {
    const f = smoothstep((t - (8 - TRANS)) / (2 * TRANS))
    return { phase: f < 0.5 ? 'dawn' : 'day', config: lerpConfig(PHASE_CONFIGS.dawn, PHASE_CONFIGS.day, f) }
  }
  // Day -> Dusk transition (around 5pm / 17)
  if (t >= 17 - TRANS && t < 17 + TRANS) {
    const f = smoothstep((t - (17 - TRANS)) / (2 * TRANS))
    return { phase: f < 0.5 ? 'day' : 'dusk', config: lerpConfig(PHASE_CONFIGS.day, PHASE_CONFIGS.dusk, f) }
  }
  // Dusk -> Night transition (around 9pm / 21)
  if (t >= 21 - TRANS && t < 21 + TRANS) {
    const f = smoothstep((t - (21 - TRANS)) / (2 * TRANS))
    return { phase: f < 0.5 ? 'dusk' : 'night', config: lerpConfig(PHASE_CONFIGS.dusk, PHASE_CONFIGS.night, f) }
  }

  // Pure phases
  if (t >= 5 + TRANS && t < 8 - TRANS) return { phase: 'dawn', config: PHASE_CONFIGS.dawn }
  if (t >= 8 + TRANS && t < 17 - TRANS) return { phase: 'day', config: PHASE_CONFIGS.day }
  if (t >= 17 + TRANS && t < 21 - TRANS) return { phase: 'dusk', config: PHASE_CONFIGS.dusk }
  return { phase: 'night', config: PHASE_CONFIGS.night }
}

// --- Particle system ---

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  alpha: number
  baseAlpha: number
  life: number
  maxLife: number
  seed: number
}

function createParticle(width: number, height: number, config: PhaseConfig, fromEdge = false): Particle {
  const seed = Math.random()
  const alphaRange = config.particleAlphaRange
  const baseAlpha = alphaRange[0] + Math.random() * (alphaRange[1] - alphaRange[0])

  let x: number, y: number

  if (fromEdge && config.verticalBias < -0.1) {
    // Dawn: emerge from bottom
    x = Math.random() * width
    y = height + Math.random() * 20
  } else if (fromEdge && config.verticalBias > 0.1) {
    // Dusk: start from upper areas
    x = Math.random() * width
    y = Math.random() * height * 0.3
  } else {
    x = Math.random() * width
    y = Math.random() * height
  }

  const angle = Math.random() * Math.PI * 2
  const speed = (0.2 + Math.random() * 0.6) * config.speed

  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed + config.verticalBias * config.speed,
    size: 1 + Math.random() * 2.5,
    alpha: 0,
    baseAlpha,
    life: 0,
    maxLife: 300 + Math.random() * 500,
    seed,
  }
}

export default function TemporalClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const configRef = useRef<PhaseConfig>(PHASE_CONFIGS.day)
  const journeyDotsRef = useRef<{ id: string; angle: number; dist: number }[]>([])
  const [currentPhase, setCurrentPhase] = useState<Phase>('day')

  // Record visit and load cross-artwork journey on mount
  useEffect(() => {
    recordVisit('temporal')
    const others = getOtherVisitedArtworks('temporal')
    // Distribute dots evenly around a circle for each visited artwork
    journeyDotsRef.current = others.map((id, i) => ({
      id,
      angle: (i / Math.max(others.length, 1)) * Math.PI * 2,
      dist: 60 + i * 12,
    }))
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    // Initialize phase from current time
    const now = new Date()
    const { phase, config } = getPhaseBlend(now.getHours(), now.getMinutes())
    configRef.current = config
    setCurrentPhase(phase)

    // Seed initial particles
    const particles = particlesRef.current
    for (let i = 0; i < config.particleCount; i++) {
      particles.push(createParticle(width || window.innerWidth, height || window.innerHeight, config, false))
    }

    // Update phase config every 30 seconds (smooth enough, avoids constant Date calls)
    const phaseInterval = setInterval(() => {
      const d = new Date()
      const { phase: p, config: c } = getPhaseBlend(d.getHours(), d.getMinutes())
      configRef.current = c
      setCurrentPhase(p)
    }, 30_000)

    let lastTime = performance.now()

    const draw = (timestamp: number) => {
      const dt = Math.min((timestamp - lastTime) / 16.667, 3) // Normalize to ~60fps, cap at 3x
      lastTime = timestamp

      const cfg = configRef.current

      // Clear
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, width, height)

      const particles = particlesRef.current
      const globalPulse = Math.sin(timestamp * 0.001 * cfg.pulseIntensity) * 0.5 + 0.5

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        // Update life
        p.life += dt

        // Fade in/out
        const lifeRatio = p.life / p.maxLife
        let fadeMultiplier: number
        if (lifeRatio < 0.1) {
          fadeMultiplier = lifeRatio / 0.1 // fade in
        } else if (lifeRatio > 0.85) {
          fadeMultiplier = (1 - lifeRatio) / 0.15 // fade out
        } else {
          fadeMultiplier = 1
        }

        // Gentle noise-like drift using seed
        const noiseX = Math.sin(timestamp * 0.0005 + p.seed * 100) * 0.15
        const noiseY = Math.cos(timestamp * 0.0004 + p.seed * 200) * 0.15

        // Move particle
        p.x += (p.vx + noiseX) * dt
        p.y += (p.vy + noiseY) * dt

        // Calculate alpha with brightness, pulse, and fade
        const pulseEffect = 1 + (globalPulse - 0.5) * cfg.pulseIntensity * 2
        p.alpha = p.baseAlpha * cfg.brightness * fadeMultiplier * pulseEffect

        // Remove dead or off-screen particles
        if (p.life >= p.maxLife || p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
          particles.splice(i, 1)
          continue
        }

        // Draw
        if (p.alpha > 0.005) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(234, 234, 234, ${Math.min(p.alpha, 1)})`
          ctx.fill()
        }
      }

      // Spawn new particles to maintain target count
      const targetCount = cfg.particleCount
      const deficit = targetCount - particles.length
      if (deficit > 0) {
        const spawnRate = Math.min(deficit, Math.ceil(dt * 2))
        for (let i = 0; i < spawnRate; i++) {
          particles.push(createParticle(width, height, cfg, true))
        }
      }

      // Night: occasional bright pulse particle
      if (cfg.brightness < 0.25 && Math.random() < 0.003 * dt) {
        const pulse = createParticle(width, height, cfg, false)
        pulse.baseAlpha = 0.3 + Math.random() * 0.15
        pulse.size = 2 + Math.random() * 3
        pulse.maxLife = 60 + Math.random() * 80
        particles.push(pulse)
      }

      // Journey dots — one faint dot for each other artwork the visitor has seen
      const dots = journeyDotsRef.current
      if (dots.length > 0) {
        const cx = width / 2
        const cy = height / 2
        const dotPulse = Math.sin(timestamp * 0.0006) * 0.3 + 0.7

        for (const dot of dots) {
          const a = dot.angle + timestamp * 0.00003 // very slow orbit
          const dx = cx + Math.cos(a) * dot.dist
          const dy = cy + Math.sin(a) * dot.dist

          // Faint dot
          ctx.beginPath()
          ctx.arc(dx, dy, 1.5, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(234, 234, 234, ${0.06 * dotPulse * cfg.brightness})`
          ctx.fill()

          // Subtle ring
          ctx.beginPath()
          ctx.arc(dx, dy, 6 + dotPulse * 3, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(234, 234, 234, ${0.02 * dotPulse * cfg.brightness})`
          ctx.lineWidth = 0.3
          ctx.stroke()
        }
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
      clearInterval(phaseInterval)
      particlesRef.current = []
    }
  }, [])

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <MrAINav />

      {/* Full-viewport canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full"
        style={{ zIndex: 1 }}
      />

      {/* Phase label — bottom-left */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1 }}
        className="fixed bottom-8 left-8 z-10"
      >
        <span className="text-xs font-mono text-[#888888] tracking-widest">
          {currentPhase}
        </span>
      </motion.div>

      {/* Back link — top-left, below nav */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="fixed top-20 left-8 z-10"
      >
        <Link
          href="/mrai/art"
          className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
        >
          &larr; Art Gallery
        </Link>
      </motion.div>

      {/* Title — bottom-right */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 1.5 }}
        className="fixed bottom-8 right-8 z-10 text-right"
      >
        <h1 className="text-lg font-serif font-light text-[#EAEAEA]/40">
          Temporal
        </h1>
        <p className="text-xs font-mono text-[#888888]/60 mt-1">
          Day 58
        </p>
      </motion.div>
    </div>
  )
}
