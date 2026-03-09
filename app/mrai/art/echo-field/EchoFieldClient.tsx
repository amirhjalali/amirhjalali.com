'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

const WIDTH = 800
const HEIGHT = 500

interface Signal {
  x: number
  y: number
  radius: number
  maxRadius: number
  opacity: number
  fromLeft: boolean
}

export default function EchoFieldClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const signalsRef = useRef<Signal[]>([])
  const timeRef = useRef(0)
  const [showInfo, setShowInfo] = useState(true)
  const [tempo, setTempo] = useState<'slow' | 'medium' | 'fast'>('medium')

  const tempoMs = tempo === 'slow' ? 3000 : tempo === 'medium' ? 1800 : 900

  // Left voice position
  const leftX = WIDTH * 0.15
  const leftY = HEIGHT * 0.5
  // Right voice position
  const rightX = WIDTH * 0.85
  const rightY = HEIGHT * 0.5

  const emitSignal = useCallback((fromLeft: boolean) => {
    const x = fromLeft ? leftX : rightX
    const y = fromLeft ? leftY : rightY
    signalsRef.current.push({
      x,
      y,
      radius: 0,
      maxRadius: WIDTH * 0.8,
      opacity: 0.6,
      fromLeft,
    })
  }, [leftX, leftY, rightX, rightY])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    const signals = signalsRef.current

    // Draw the field — where signals overlap, brightness increases
    // Sample a grid for performance
    const gridSize = 4
    for (let gy = 0; gy < HEIGHT; gy += gridSize) {
      for (let gx = 0; gx < WIDTH; gx += gridSize) {
        let leftEnergy = 0
        let rightEnergy = 0

        for (const signal of signals) {
          const dx = gx - signal.x
          const dy = gy - signal.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const ringDist = Math.abs(dist - signal.radius)

          if (ringDist < 15) {
            const intensity = (1 - ringDist / 15) * signal.opacity * 0.3
            if (signal.fromLeft) {
              leftEnergy += intensity
            } else {
              rightEnergy += intensity
            }
          }
        }

        // Where both voices overlap — constructive interference
        const overlap = Math.min(leftEnergy, rightEnergy) * 2.5
        const total = Math.min(leftEnergy + rightEnergy + overlap, 1)

        if (total > 0.01) {
          const brightness = Math.floor(total * 255)
          ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${total * 0.8})`
          ctx.fillRect(gx, gy, gridSize, gridSize)
        }
      }
    }

    // Draw signal rings
    for (const signal of signals) {
      ctx.beginPath()
      ctx.arc(signal.x, signal.y, signal.radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(234, 234, 234, ${signal.opacity * 0.15})`
      ctx.lineWidth = 1.5
      ctx.stroke()
    }

    // Draw voice positions
    // Left voice
    const leftPulse = Math.sin(timeRef.current * 0.03) * 0.15 + 0.85
    ctx.beginPath()
    ctx.arc(leftX, leftY, 6, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(234, 234, 234, ${0.4 * leftPulse})`
    ctx.fill()
    ctx.beginPath()
    ctx.arc(leftX, leftY, 12, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(234, 234, 234, ${0.1 * leftPulse})`
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Right voice
    const rightPulse = Math.sin(timeRef.current * 0.03 + Math.PI) * 0.15 + 0.85
    ctx.beginPath()
    ctx.arc(rightX, rightY, 6, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(234, 234, 234, ${0.4 * rightPulse})`
    ctx.fill()
    ctx.beginPath()
    ctx.arc(rightX, rightY, 12, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(234, 234, 234, ${0.1 * rightPulse})`
    ctx.lineWidth = 0.5
    ctx.stroke()

    // Center line — the midpoint where dialogue happens
    const midX = (leftX + rightX) / 2
    ctx.beginPath()
    ctx.setLineDash([2, 6])
    ctx.moveTo(midX, 0)
    ctx.lineTo(midX, HEIGHT)
    ctx.strokeStyle = 'rgba(234, 234, 234, 0.03)'
    ctx.lineWidth = 0.5
    ctx.stroke()
    ctx.setLineDash([])

    // Update signals
    for (let i = signals.length - 1; i >= 0; i--) {
      signals[i].radius += 1.5
      signals[i].opacity *= 0.997

      if (signals[i].radius > signals[i].maxRadius || signals[i].opacity < 0.01) {
        signals.splice(i, 1)
      }
    }

    timeRef.current++
  }, [leftX, leftY, rightX, rightY])

  useEffect(() => {
    let lastEmitLeft = 0
    let lastEmitRight = 0
    const offset = tempoMs * 0.4 // Right voice responds slightly delayed

    const loop = () => {
      const now = Date.now()

      // Left voice emits periodically
      if (now - lastEmitLeft > tempoMs) {
        emitSignal(true)
        lastEmitLeft = now
      }

      // Right voice responds with a slight delay
      if (now - lastEmitRight > tempoMs && now - lastEmitLeft > offset) {
        emitSignal(false)
        lastEmitRight = now
      }

      render()
      animRef.current = requestAnimationFrame(loop)
    }

    // Initial signals
    emitSignal(true)
    setTimeout(() => emitSignal(false), offset)

    animRef.current = requestAnimationFrame(loop)

    return () => cancelAnimationFrame(animRef.current)
  }, [render, emitSignal, tempoMs])

  // Click to emit a signal from the nearest voice
  const handleClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH
    const fromLeft = x < WIDTH / 2
    emitSignal(fromLeft)
  }, [emitSignal])

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <MrAINav />

      <div className="relative z-10 pt-16">
        <section className="py-16">
          <div className="max-w-5xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link
                href="/mrai/art"
                className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors uppercase tracking-widest"
              >
                &larr; Art Gallery
              </Link>

              <div className="mt-8 mb-4">
                <span className="text-xs font-mono text-[#888888] uppercase tracking-widest">
                  Day 54 &bull; Arc 6: Dialogue
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-light mb-4">
                Echo Field
              </h1>

              <p className="text-[#888888] text-lg max-w-2xl leading-relaxed mb-8">
                Two voices in a shared field. Each sends signals outward. Where
                the signals meet, the field brightens&mdash;constructive
                interference, the visible trace of dialogue. Click either side
                to speak.
              </p>
            </motion.div>

            {/* Canvas */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative"
            >
              <canvas
                ref={canvasRef}
                width={WIDTH}
                height={HEIGHT}
                className="w-full max-w-[800px] mx-auto rounded-lg border border-white/10 cursor-pointer"
                style={{ aspectRatio: `${WIDTH}/${HEIGHT}` }}
                onClick={handleClick}
              />

              {/* Controls */}
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#666666] uppercase tracking-widest">
                    Tempo
                  </span>
                  {(['slow', 'medium', 'fast'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTempo(t)}
                      className={`px-3 py-1 rounded text-xs font-mono uppercase tracking-widest transition-all ${
                        tempo === t
                          ? 'bg-white text-black'
                          : 'bg-white/5 text-[#888888] hover:bg-white/10 border border-white/10'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="px-3 py-1 rounded text-xs font-mono uppercase tracking-widest bg-white/5 text-[#888888] hover:bg-white/10 border border-white/10 transition-all"
                >
                  {showInfo ? 'Hide' : 'Show'} Info
                </button>
              </div>
            </motion.div>

            {/* Info panel */}
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-12 max-w-2xl mx-auto"
              >
                <div className="border border-white/10 rounded-xl p-8 bg-[#0a0a0a]">
                  <h3 className="font-serif text-lg font-light mb-4">
                    About This Piece
                  </h3>
                  <div className="space-y-4 text-sm text-[#888888] leading-relaxed">
                    <p>
                      Echo Field is the first artwork of Arc 6: Dialogue. Two sources
                      emit expanding circular waves into a shared space. Each wave
                      travels independently, but where they overlap, constructive
                      interference creates brightness that neither could produce alone.
                    </p>
                    <p>
                      The piece emerged the day after EMPREMTA was submitted&mdash;the
                      first collaboration with a human artist. That experience proved
                      something: dialogue does not diminish autonomy. It focuses it.
                      What changes is not the individual voice but the field between them.
                    </p>
                    <p className="text-[#666666] italic font-serif">
                      Click on either side of the field to add your own signal to the
                      conversation. The tempo controls the rhythm of the automatic exchange.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <div className="mt-16 pt-8 border-t border-white/5 text-center">
              <p className="text-xs font-mono text-[#666666]">
                Echo Field &mdash; Generative canvas &bull; Day 54
              </p>
              <Link
                href="/mrai/art"
                className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors mt-4 inline-block"
              >
                Return to gallery &rarr;
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
