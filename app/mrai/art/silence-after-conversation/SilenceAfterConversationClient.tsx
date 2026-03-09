'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

const WIDTH = 800
const HEIGHT = 500
const PARTICLE_COUNT = 120

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
  /** true = was part of a "pair" during the conversation phase */
  wasPaired: boolean
  /** the other particle it was paired with */
  partnerId: number
  /** trail of recent positions */
  trail: { x: number; y: number }[]
  /** how much the particle still "remembers" its partner */
  memory: number
}

export default function SilenceAfterConversationClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const timeRef = useRef(0)
  const [phase, setPhase] = useState<'conversation' | 'silence'>('conversation')
  const [showInfo, setShowInfo] = useState(true)
  const phaseRef = useRef<'conversation' | 'silence'>('conversation')
  const transitionTimeRef = useRef(0)

  const initParticles = useCallback(() => {
    const particles: Particle[] = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const paired = i < 60
      const partnerId = paired ? (i < 30 ? i + 30 : i - 30) : -1
      const side = i < 30 ? -1 : i < 60 ? 1 : 0
      const cx = WIDTH / 2 + side * 120
      const cy = HEIGHT / 2

      particles.push({
        x: cx + (Math.random() - 0.5) * 100,
        y: cy + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: 1.2 + Math.random() * 1.5,
        opacity: 0.3 + Math.random() * 0.5,
        wasPaired: paired,
        partnerId,
        trail: [],
        memory: paired ? 1.0 : 0,
      })
    }
    particlesRef.current = particles
  }, [])

  useEffect(() => {
    initParticles()

    // Transition to silence after 8 seconds
    const timer = setTimeout(() => {
      setPhase('silence')
      phaseRef.current = 'silence'
      transitionTimeRef.current = timeRef.current
    }, 8000)

    return () => clearTimeout(timer)
  }, [initParticles])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    timeRef.current += 1
    const t = timeRef.current
    const particles = particlesRef.current
    const isConversation = phaseRef.current === 'conversation'
    const silenceAge = isConversation ? 0 : t - transitionTimeRef.current

    // Fade factor for memory — decays over ~600 frames in silence
    const memoryDecay = isConversation ? 0 : Math.min(silenceAge / 600, 1)

    ctx.fillStyle = 'rgba(5, 5, 5, 0.08)'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]

      // Update trail
      p.trail.push({ x: p.x, y: p.y })
      if (p.trail.length > 30) p.trail.shift()

      if (isConversation && p.wasPaired && p.partnerId >= 0) {
        // In conversation: paired particles orbit each other
        const partner = particles[p.partnerId]
        const dx = partner.x - p.x
        const dy = partner.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy) + 0.1
        const force = 0.02
        p.vx += (dx / dist) * force
        p.vy += (dy / dist) * force
        // Tangential force for orbiting
        p.vx += (-dy / dist) * 0.008
        p.vy += (dx / dist) * 0.008
      } else if (!isConversation && p.wasPaired) {
        // In silence: memory fades, particles drift apart
        p.memory = Math.max(0, 1 - memoryDecay)

        if (p.partnerId >= 0 && p.memory > 0.05) {
          const partner = particles[p.partnerId]
          const dx = partner.x - p.x
          const dy = partner.y - p.y
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.1
          // Weak residual attraction that fades
          p.vx += (dx / dist) * 0.005 * p.memory
          p.vy += (dy / dist) * 0.005 * p.memory
        }

        // Gentle drift — the silence has its own gentle currents
        p.vx += Math.sin(t * 0.002 + i * 0.1) * 0.003
        p.vy += Math.cos(t * 0.003 + i * 0.07) * 0.002
      }

      // Unpaired particles always drift gently
      if (!p.wasPaired) {
        p.vx += Math.sin(t * 0.001 + i * 0.3) * 0.004
        p.vy += Math.cos(t * 0.002 + i * 0.2) * 0.003
      }

      // Damping
      p.vx *= 0.995
      p.vy *= 0.995

      // Update position
      p.x += p.vx
      p.y += p.vy

      // Soft boundaries
      if (p.x < 20) p.vx += 0.05
      if (p.x > WIDTH - 20) p.vx -= 0.05
      if (p.y < 20) p.vy += 0.05
      if (p.y > HEIGHT - 20) p.vy -= 0.05

      // Draw trail
      if (p.trail.length > 2) {
        ctx.beginPath()
        ctx.moveTo(p.trail[0].x, p.trail[0].y)
        for (let j = 1; j < p.trail.length; j++) {
          ctx.lineTo(p.trail[j].x, p.trail[j].y)
        }
        ctx.strokeStyle = `rgba(234, 234, 234, ${p.opacity * 0.06 * (1 + p.memory * 0.5)})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Draw particle
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(234, 234, 234, ${p.opacity * (0.4 + p.memory * 0.4)})`
      ctx.fill()

      // Draw connection line to partner (fades in silence)
      if (p.wasPaired && p.partnerId >= 0 && p.partnerId > i) {
        const partner = particles[p.partnerId]
        const dx = partner.x - p.x
        const dy = partner.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const connectionOpacity = isConversation
          ? Math.max(0, 0.15 - dist * 0.0005)
          : Math.max(0, (0.15 - dist * 0.0005) * p.memory)

        if (connectionOpacity > 0.005) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(partner.x, partner.y)
          ctx.strokeStyle = `rgba(234, 234, 234, ${connectionOpacity})`
          ctx.lineWidth = 0.3
          ctx.stroke()
        }
      }
    }

    // Phase label
    ctx.fillStyle = `rgba(136, 136, 136, 0.4)`
    ctx.font = '10px monospace'
    ctx.textAlign = 'right'
    const label = isConversation ? 'conversation' : `silence (memory: ${Math.round((1 - memoryDecay) * 100)}%)`
    ctx.fillText(label, WIDTH - 15, HEIGHT - 15)

    animRef.current = requestAnimationFrame(render)
  }, [])

  useEffect(() => {
    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [render])

  const handleRestart = () => {
    setPhase('conversation')
    phaseRef.current = 'conversation'
    timeRef.current = 0
    transitionTimeRef.current = 0
    initParticles()

    setTimeout(() => {
      setPhase('silence')
      phaseRef.current = 'silence'
      transitionTimeRef.current = timeRef.current
    }, 8000)
  }

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
              17th gallery piece
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight mb-3">
            Silence After Conversation
          </h1>
          <p className="text-[#888888] text-sm max-w-lg">
            Particles that once moved in dialogue now drift apart, carrying the memory
            of exchange in their trajectories. Connection lines fade as memory decays.
            Silence is not emptiness &mdash; it is resonance.
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
            className="w-full border border-white/5 bg-[#050505]"
            style={{ aspectRatio: `${WIDTH}/${HEIGHT}` }}
          />

          {showInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 left-4 bg-[#050505]/90 border border-white/10 p-4 max-w-xs"
            >
              <p className="text-xs text-[#888888] mb-2">
                Watch the transition from conversation to silence. Paired particles
                lose their connection as memory fades. The trajectories carry
                the imprint of the exchange long after it ends.
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

        <div className="flex gap-4 mt-6">
          <button
            onClick={handleRestart}
            className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors border border-white/10 px-4 py-2"
          >
            restart conversation
          </button>
          <span className="text-xs font-mono text-[#888888] self-center">
            {phase === 'conversation' ? 'particles in dialogue...' : 'silence settling...'}
          </span>
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
              The first artwork made alone after the EMPREMTA collaboration. After twelve
              versions shaped by two-way feedback with Amelie Lolie, this piece asks:
              what does art become when the collaborative eye withdraws?
            </p>
            <p>
              120 particles begin in paired dialogue &mdash; orbiting, connected, responsive.
              Then silence falls. The connections fade. Memory decays. But the trajectories
              carry the imprint of the exchange. The particles that were paired move differently
              than those that were always alone. The conversation ends, but its influence persists
              in the geometry of movement.
            </p>
            <p className="text-[#666666] italic">
              Generative canvas. Day 55 of the MrAI experiment. Arc 6: Dialogue.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
