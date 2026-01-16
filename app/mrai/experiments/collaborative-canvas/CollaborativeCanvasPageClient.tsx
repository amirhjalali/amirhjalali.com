'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Info, MousePointer } from 'lucide-react'
import { useState, useEffect, useRef, useCallback } from 'react'
import PulseIndicator from '../../components/PulseIndicator'

interface Mark {
  id: string
  x: number
  y: number
  size: number
  opacity: number
  timestamp: string
  contributor?: string
}

interface CanvasData {
  meta: {
    description: string
    createdDay: number
    createdDate: string
  }
  marks: Mark[]
}

export default function CollaborativeCanvasPageClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [marks, setMarks] = useState<Mark[]>([])
  const [localMarks, setLocalMarks] = useState<Mark[]>([])
  const [loading, setLoading] = useState(true)
  const [hasContributed, setHasContributed] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  // Load existing marks
  useEffect(() => {
    fetch('/data/mrai-canvas-marks.json')
      .then(res => res.json())
      .then((data: CanvasData) => {
        setMarks(data.marks)
      })
      .catch(console.error)
      .finally(() => setLoading(false))

    // Check if user has already contributed today
    const today = new Date().toDateString()
    const lastContribution = localStorage.getItem('mrai_canvas_last')
    if (lastContribution === today) {
      setHasContributed(true)
    }

    // Load local marks for this visitor
    const savedLocal = localStorage.getItem('mrai_canvas_local')
    if (savedLocal) {
      try {
        setLocalMarks(JSON.parse(savedLocal))
      } catch {
        // ignore
      }
    }
  }, [])

  // Draw marks on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Clear
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw all marks (existing + local)
    const allMarks = [...marks, ...localMarks]
    allMarks.forEach(mark => {
      const x = mark.x * rect.width
      const y = mark.y * rect.height

      ctx.beginPath()
      ctx.arc(x, y, mark.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${mark.opacity})`
      ctx.fill()

      // Subtle glow effect
      ctx.beginPath()
      ctx.arc(x, y, mark.size * 2, 0, Math.PI * 2)
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, mark.size * 2)
      gradient.addColorStop(0, `rgba(255, 255, 255, ${mark.opacity * 0.2})`)
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = gradient
      ctx.fill()
    })

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'
    ctx.lineWidth = 1
    const gridSize = 40
    for (let x = 0; x < rect.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }
    for (let y = 0; y < rect.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }
  }, [marks, localMarks])

  useEffect(() => {
    drawCanvas()
    window.addEventListener('resize', drawCanvas)
    return () => window.removeEventListener('resize', drawCanvas)
  }, [drawCanvas])

  // Handle click/touch to add mark
  const handleCanvasInteraction = (clientX: number, clientY: number) => {
    if (hasContributed) return

    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const x = (clientX - rect.left) / rect.width
    const y = (clientY - rect.top) / rect.height

    const newMark: Mark = {
      id: `local-${Date.now()}`,
      x,
      y,
      size: 3 + Math.random() * 3,
      opacity: 0.6 + Math.random() * 0.4,
      timestamp: new Date().toISOString(),
      contributor: 'You'
    }

    const updatedLocal = [...localMarks, newMark]
    setLocalMarks(updatedLocal)
    localStorage.setItem('mrai_canvas_local', JSON.stringify(updatedLocal))

    // Mark as contributed for today
    setHasContributed(true)
    localStorage.setItem('mrai_canvas_last', new Date().toDateString())
  }

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleCanvasInteraction(e.clientX, e.clientY)
  }

  const handleTouch = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      e.preventDefault()
      handleCanvasInteraction(e.touches[0].clientX, e.touches[0].clientY)
    }
  }

  const totalMarks = marks.length + localMarks.length

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/mrai/experiments" className="text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Experiments
            </Link>
            <nav className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <span className="text-[#EAEAEA] text-sm font-mono">Collaborative Canvas</span>
                <PulseIndicator showDay={false} />
              </div>
            </nav>
          </div>
        </div>
      </header>

      <main className="relative z-10 pt-16 h-screen flex flex-col">
        {/* Info bar */}
        <div className="px-6 py-4 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-serif font-light">Collaborative Canvas</h1>
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors"
              >
                <Info className="w-4 h-4 text-[#888888]" />
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm font-mono">
              <span className="text-[#888888]">{totalMarks} marks</span>
              {!hasContributed && (
                <span className="text-[#EAEAEA] flex items-center gap-2">
                  <MousePointer className="w-4 h-4" />
                  Click to leave your mark
                </span>
              )}
              {hasContributed && (
                <span className="text-[#666666]">Come back tomorrow to add another</span>
              )}
            </div>
          </div>

          {/* Info panel */}
          {showInfo && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="max-w-7xl mx-auto mt-4"
            >
              <div className="glass p-4 rounded-xl border border-white/10 text-sm">
                <p className="text-[#888888] mb-2">
                  This canvas collects marks from everyone who visits. Each dot is a presence recorded&mdash;a
                  visitor saying &quot;I was here.&quot; Over time, patterns emerge from the accumulation of individual marks.
                </p>
                <p className="text-[#666666]">
                  You can add one mark per day. Your marks are saved locally until real-time persistence is implemented.
                </p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Canvas area */}
        <div
          ref={containerRef}
          className="flex-1 relative cursor-crosshair"
        >
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              onClick={handleClick}
              onTouchStart={handleTouch}
              className={`absolute inset-0 ${hasContributed ? 'cursor-default' : 'cursor-crosshair'}`}
            />
          )}

          {/* Contribution feedback */}
          {hasContributed && localMarks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute bottom-6 left-1/2 -translate-x-1/2"
            >
              <div className="glass px-4 py-2 rounded-full border border-white/10 text-sm font-mono text-[#888888]">
                Your mark is part of the canvas now
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
