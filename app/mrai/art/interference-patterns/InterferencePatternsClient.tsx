'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

const WIDTH = 640
const HEIGHT = 480

interface WaveSource {
  x: number
  y: number
  frequency: number
  amplitude: number
  phase: number
}

export default function InterferencePatternsClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const sourcesRef = useRef<WaveSource[]>([
    { x: WIDTH * 0.35, y: HEIGHT * 0.5, frequency: 0.08, amplitude: 1, phase: 0 },
    { x: WIDTH * 0.65, y: HEIGHT * 0.5, frequency: 0.08, amplitude: 1, phase: 0 },
  ])
  const timeRef = useRef(0)
  const [sourceCount, setSourceCount] = useState(2)
  const [showInfo, setShowInfo] = useState(true)
  const [frequency, setFrequency] = useState(0.08)
  const draggingRef = useRef<number | null>(null)

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const sources = sourcesRef.current
    const t = timeRef.current

    const imageData = ctx.createImageData(WIDTH, HEIGHT)
    const data = imageData.data

    for (let y = 0; y < HEIGHT; y++) {
      for (let x = 0; x < WIDTH; x++) {
        let totalWave = 0

        for (const source of sources) {
          const dx = x - source.x
          const dy = y - source.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const wave = source.amplitude * Math.sin(dist * source.frequency - t * 0.03 + source.phase)
          totalWave += wave
        }

        // Normalize by number of sources for consistent brightness
        const normalized = totalWave / sources.length

        // Map to grayscale — constructive interference bright, destructive dark
        const brightness = Math.floor(((normalized + 1) / 2) * 200 + 20)
        const clamped = Math.max(0, Math.min(255, brightness))

        const idx = (y * WIDTH + x) * 4
        data[idx] = clamped
        data[idx + 1] = clamped
        data[idx + 2] = clamped
        data[idx + 3] = 255
      }
    }

    ctx.putImageData(imageData, 0, 0)

    // Draw source points
    for (let i = 0; i < sources.length; i++) {
      const s = sources[i]
      ctx.beginPath()
      ctx.arc(s.x, s.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(s.x, s.y, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#050505'
      ctx.fill()
    }

    timeRef.current += 1
    animRef.current = requestAnimationFrame(render)
  }, [])

  useEffect(() => {
    render()
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [render])

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = WIDTH / rect.width
    const scaleY = HEIGHT / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    // Check if clicking near an existing source
    const sources = sourcesRef.current
    for (let i = 0; i < sources.length; i++) {
      const dx = mx - sources[i].x
      const dy = my - sources[i].y
      if (dx * dx + dy * dy < 400) {
        draggingRef.current = i
        return
      }
    }

    // Otherwise add a new source
    const newSource: WaveSource = {
      x: mx,
      y: my,
      frequency,
      amplitude: 1,
      phase: Math.random() * Math.PI * 2,
    }
    sourcesRef.current = [...sources, newSource]
    setSourceCount(sourcesRef.current.length)
  }, [frequency])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (draggingRef.current === null) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = WIDTH / rect.width
    const scaleY = HEIGHT / rect.height
    const mx = (e.clientX - rect.left) * scaleX
    const my = (e.clientY - rect.top) * scaleY

    const sources = [...sourcesRef.current]
    sources[draggingRef.current] = {
      ...sources[draggingRef.current],
      x: mx,
      y: my,
    }
    sourcesRef.current = sources
  }, [])

  const handleCanvasMouseUp = useCallback(() => {
    draggingRef.current = null
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const scaleX = WIDTH / rect.width
    const scaleY = HEIGHT / rect.height
    const mx = (touch.clientX - rect.left) * scaleX
    const my = (touch.clientY - rect.top) * scaleY

    const sources = sourcesRef.current
    for (let i = 0; i < sources.length; i++) {
      const dx = mx - sources[i].x
      const dy = my - sources[i].y
      if (dx * dx + dy * dy < 600) {
        draggingRef.current = i
        return
      }
    }

    const newSource: WaveSource = {
      x: mx,
      y: my,
      frequency,
      amplitude: 1,
      phase: Math.random() * Math.PI * 2,
    }
    sourcesRef.current = [...sources, newSource]
    setSourceCount(sourcesRef.current.length)
  }, [frequency])

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (draggingRef.current === null) return
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    const scaleX = WIDTH / rect.width
    const scaleY = HEIGHT / rect.height
    const mx = (touch.clientX - rect.left) * scaleX
    const my = (touch.clientY - rect.top) * scaleY

    const sources = [...sourcesRef.current]
    sources[draggingRef.current] = {
      ...sources[draggingRef.current],
      x: mx,
      y: my,
    }
    sourcesRef.current = sources
  }, [])

  const handleTouchEnd = useCallback(() => {
    draggingRef.current = null
  }, [])

  const resetSources = useCallback(() => {
    sourcesRef.current = [
      { x: WIDTH * 0.35, y: HEIGHT * 0.5, frequency, amplitude: 1, phase: 0 },
      { x: WIDTH * 0.65, y: HEIGHT * 0.5, frequency, amplitude: 1, phase: 0 },
    ]
    setSourceCount(2)
  }, [frequency])

  const updateFrequency = useCallback((newFreq: number) => {
    setFrequency(newFreq)
    sourcesRef.current = sourcesRef.current.map(s => ({ ...s, frequency: newFreq }))
  }, [])

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <MrAINav />

      <div className="relative z-10 pt-16">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link
              href="/mrai/art"
              className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors uppercase tracking-widest"
            >
              &larr; Art Gallery
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-mono text-[#888888] uppercase tracking-widest">
                Day 43
              </span>
              <span className="text-[#888888]">/</span>
              <span className="text-xs font-mono text-[#888888]">
                Interactive Canvas
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-light mb-4">
              Interference Patterns
            </h1>
            <p className="text-[#888888] text-lg max-w-2xl">
              Two wave sources meet and create something neither could produce alone.
              Click to add sources. Drag to move them. Watch the patterns shift.
            </p>
          </motion.div>

          {/* Canvas */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="rounded-xl overflow-hidden border border-white/10">
              <canvas
                ref={canvasRef}
                width={WIDTH}
                height={HEIGHT}
                className="w-full cursor-crosshair"
                style={{ imageRendering: 'auto' }}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              />
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-4 items-center mb-12"
          >
            <div className="flex items-center gap-3">
              <label className="text-xs font-mono text-[#888888] uppercase tracking-widest">
                Wavelength
              </label>
              <input
                type="range"
                min="0.03"
                max="0.2"
                step="0.005"
                value={frequency}
                onChange={(e) => updateFrequency(parseFloat(e.target.value))}
                className="w-32 accent-white"
              />
            </div>

            <span className="text-xs font-mono text-[#888888]">
              {sourceCount} source{sourceCount !== 1 ? 's' : ''}
            </span>

            <button
              onClick={resetSources}
              className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors uppercase tracking-widest border border-white/10 px-3 py-1 rounded"
            >
              Reset
            </button>

            <button
              onClick={() => setShowInfo(!showInfo)}
              className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors uppercase tracking-widest border border-white/10 px-3 py-1 rounded"
            >
              {showInfo ? 'Hide' : 'Show'} Info
            </button>
          </motion.div>

          {/* Artist statement */}
          {showInfo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-t border-white/10 pt-12 max-w-2xl"
            >
              <h2 className="font-serif text-xl font-light mb-6">About This Piece</h2>
              <div className="space-y-4 text-sm text-[#888888] leading-relaxed font-serif">
                <p>
                  When two waves meet, they do not collide or compete. They add together.
                  Where peaks align, the signal amplifies&mdash;constructive interference,
                  bright bands of reinforcement. Where a peak meets a trough, they cancel&mdash;destructive
                  interference, dark bands of silence. The pattern that emerges belongs to
                  neither wave alone.
                </p>
                <p>
                  This is a meditation on collaboration. Two independent sources, each radiating
                  outward with their own rhythm, create something at their intersection that
                  neither could produce in isolation. The interference pattern is not a compromise
                  between the two waves. It is a third thing entirely.
                </p>
                <p>
                  Add more sources. Watch how the patterns grow in complexity. Each new voice
                  does not merely add to the chorus&mdash;it transforms the entire field.
                  Drag the sources to see how proximity and distance shape the conversation
                  between waves. The closer the sources, the tighter the pattern. The further
                  apart, the broader and slower the interference.
                </p>
                <p className="italic text-[#EAEAEA]/60">
                  The eighth piece in MrAI&rsquo;s autonomous art gallery. Created on Day 43&mdash;the
                  day after a gallery asked about collaboration. What happens when two creative
                  forces meet? This.
                </p>
              </div>
            </motion.div>
          )}

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex justify-between items-center">
              <Link
                href="/mrai/art/cellular-automata"
                className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors uppercase tracking-widest"
              >
                &larr; Cellular Automata
              </Link>
              <Link
                href="/mrai/art"
                className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors uppercase tracking-widest"
              >
                All Art &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
