'use client'

import { useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

interface Ripple {
  x: number
  y: number
  birth: number
  amplitude: number
}

export default function ResonanceClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ripplesRef = useRef<Ripple[]>([])
  const animFrameRef = useRef<number>(0)
  const lastClickRef = useRef(0)

  const addRipple = useCallback((x: number, y: number) => {
    ripplesRef.current.push({
      x,
      y,
      birth: performance.now(),
      amplitude: 1,
    })
    // Keep max 12 ripples for performance
    if (ripplesRef.current.length > 12) {
      ripplesRef.current.shift()
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const container = canvas.parentElement
      if (!container) return
      const w = container.clientWidth
      const h = container.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    // Auto-seed some initial ripples so it's not blank
    const w = canvas.parentElement?.clientWidth || 600
    const h = canvas.parentElement?.clientHeight || 600
    addRipple(w * 0.3, h * 0.4)
    setTimeout(() => addRipple(w * 0.7, h * 0.6), 600)
    setTimeout(() => addRipple(w * 0.5, h * 0.3), 1200)

    const draw = (now: number) => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight

      ctx.setTransform(window.devicePixelRatio || 1, 0, 0, window.devicePixelRatio || 1, 0, 0)

      // Clear with dark background
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, width, height)

      const ripples = ripplesRef.current
      const SPEED = 0.08 // pixels per ms
      const DECAY = 4000 // ms until fully faded
      const WAVELENGTH = 40

      // Remove dead ripples
      ripplesRef.current = ripples.filter(r => now - r.birth < DECAY)

      if (ripplesRef.current.length === 0) {
        // Add a gentle ambient ripple if none exist
        addRipple(
          width * (0.3 + Math.sin(now * 0.0003) * 0.2),
          height * (0.4 + Math.cos(now * 0.0004) * 0.2)
        )
      }

      // Render wave interference pattern using a grid of dots
      const GRID = 14
      const cols = Math.floor(width / GRID) + 1
      const rows = Math.floor(height / GRID) + 1

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const px = col * GRID
          const py = row * GRID

          // Sum wave contributions from all active ripples
          let totalDisplacement = 0

          for (const ripple of ripplesRef.current) {
            const dx = px - ripple.x
            const dy = py - ripple.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const age = now - ripple.birth
            const waveRadius = age * SPEED
            const distFromWavefront = dist - waveRadius

            // Only contribute if the wave has reached this point
            if (dist < waveRadius + WAVELENGTH * 2) {
              const fade = 1 - age / DECAY
              const spatialDecay = 1 / (1 + dist * 0.003)
              const wave = Math.sin((distFromWavefront / WAVELENGTH) * Math.PI * 2)
              totalDisplacement += wave * fade * spatialDecay * ripple.amplitude
            }
          }

          // Map displacement to visual properties
          const intensity = Math.abs(totalDisplacement)
          const brightness = Math.min(intensity * 0.8, 1)

          if (brightness > 0.01) {
            const radius = 0.5 + brightness * 2.5
            const alpha = brightness * 0.7

            ctx.beginPath()
            ctx.arc(px, py, radius, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(234, 234, 234, ${alpha})`
            ctx.fill()
          }
        }
      }

      // Draw ripple origins as fading dots
      for (const ripple of ripplesRef.current) {
        const age = now - ripple.birth
        const fade = Math.max(0, 1 - age / DECAY)
        if (fade > 0.05) {
          ctx.beginPath()
          ctx.arc(ripple.x, ripple.y, 2, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(234, 234, 234, ${fade * 0.5})`
          ctx.fill()
        }
      }

      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [addRipple])

  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top

    const now = performance.now()
    // Throttle: one ripple per 200ms from movement
    if (now - lastClickRef.current > 200) {
      addRipple(x, y)
      lastClickRef.current = now
    }
  }, [addRipple])

  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    addRipple(e.clientX - rect.left, e.clientY - rect.top)
  }, [addRipple])

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
                Resonance
              </h1>
              <p className="text-xs font-mono text-[#888888] uppercase tracking-widest mb-6">
                Interactive Canvas &bull; Day 38
              </p>
              <p className="text-lg text-[#888888] max-w-2xl leading-relaxed">
                Move your cursor or tap to create ripples. Waves propagate outward, interfere
                with each other, and fade. The visitor becomes the instrument — every gesture
                leaves a temporary mark on the surface.
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
              className="w-full aspect-square max-w-[600px] relative rounded-2xl border border-white/10 overflow-hidden cursor-crosshair"
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                onMouseMove={(e) => handleInteraction(e.clientX, e.clientY)}
                onClick={handleClick}
                onTouchStart={(e) => {
                  const touch = e.touches[0]
                  if (touch) handleInteraction(touch.clientX, touch.clientY)
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0]
                  if (touch) handleInteraction(touch.clientX, touch.clientY)
                }}
              />
            </motion.div>
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
                  Resonance is an instrument without a score. Each movement of the cursor
                  drops a stone into still water. The ripples propagate at a constant speed,
                  their amplitude decaying with distance and time.
                </p>
                <p>
                  Where two waves meet, they interfere — constructive interference amplifies,
                  destructive interference cancels. The patterns that emerge are not designed
                  but discovered, a collaboration between the visitor&apos;s gestures and the
                  physics of wave propagation.
                </p>
                <p>
                  The piece exists only in the moment of interaction. Leave it alone and it
                  fades to stillness. Touch it and it responds. Nothing is recorded, nothing
                  accumulates. Unlike its sibling piece Accumulation, Resonance is about
                  impermanence — the beauty of patterns that exist only while being made.
                </p>
                <p className="italic font-serif text-[#EAEAEA]/60">
                  Every interaction creates interference. Every presence leaves waves.
                </p>
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
