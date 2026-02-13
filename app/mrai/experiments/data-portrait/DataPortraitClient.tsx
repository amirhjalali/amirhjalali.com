'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const ARCS = [
  { start: 1, end: 10, name: 'Building' },
  { start: 11, end: 19, name: 'Contemplation' },
  { start: 20, end: 25, name: 'Revelation' },
  { start: 26, end: 31, name: 'Sustenance' },
]

const GAP_DAY = 27
const TOTAL_DAYS = 31
const TASKS_PER_DAY = 10

export default function DataPortraitClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(undefined)
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 })

  const draw = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    const { width, height } = dimensions
    const cx = width / 2
    const cy = height / 2

    // Clear
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, width, height)

    // Draw concentric rings for each day
    for (let day = 1; day <= TOTAL_DAYS; day++) {
      const arc = ARCS.find(a => day >= a.start && day <= a.end)
      const arcIndex = arc ? ARCS.indexOf(arc) : 0
      const radius = 30 + (day / TOTAL_DAYS) * (Math.min(width, height) * 0.4)
      const isGap = day === GAP_DAY

      if (isGap) {
        // Draw gap as dashed circle
        ctx.setLineDash([4, 8])
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.setLineDash([])
        continue
      }

      // Draw 10 task marks around the ring
      for (let task = 0; task < TASKS_PER_DAY; task++) {
        const angle = (task / TASKS_PER_DAY) * Math.PI * 2 - Math.PI / 2
        const breathe = Math.sin(time * 0.5 + day * 0.3 + task * 0.5) * 0.3 + 0.7
        const r = radius + Math.sin(time * 0.3 + task) * 2

        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r

        const opacity = (0.15 + arcIndex * 0.15) * breathe
        const size = 1.5 + arcIndex * 0.5

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 234, 234, ${opacity})`
        ctx.fill()
      }

      // Subtle ring connector
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.02 + arcIndex * 0.01})`
      ctx.lineWidth = 0.5
      ctx.stroke()
    }

    // Center point — Day 0 / origin
    const centerPulse = Math.sin(time) * 0.3 + 0.7
    ctx.beginPath()
    ctx.arc(cx, cy, 4, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(234, 234, 234, ${centerPulse})`
    ctx.fill()

    // Arc boundary labels
    ctx.font = '10px monospace'
    ctx.textAlign = 'left'
    ARCS.forEach((arc, i) => {
      const labelRadius = 30 + (arc.end / TOTAL_DAYS) * (Math.min(width, height) * 0.4) + 12
      const labelAngle = -Math.PI / 4 + i * 0.15
      const lx = cx + Math.cos(labelAngle) * labelRadius
      const ly = cy + Math.sin(labelAngle) * labelRadius
      ctx.fillStyle = 'rgba(136, 136, 136, 0.5)'
      ctx.fillText(arc.name, lx, ly)
    })
  }, [dimensions])

  useEffect(() => {
    const updateDimensions = () => {
      const size = Math.min(window.innerWidth - 48, 800)
      setDimensions({ width: size, height: size })
    }
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0
    const animate = () => {
      time += 0.01
      draw(ctx, time)
      animationRef.current = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [draw])

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="text-center mb-8"
      >
        <h1 className="font-serif text-3xl font-light mb-2">Data Portrait</h1>
        <p className="text-xs font-mono text-[#888888]">
          {TOTAL_DAYS} days &middot; {TOTAL_DAYS * TASKS_PER_DAY} tasks &middot; {ARCS.length} arcs
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.5 }}
      >
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          className="rounded-xl"
          style={{ background: '#050505' }}
        />
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="text-xs text-[#888888] mt-6 max-w-md text-center leading-relaxed"
      >
        Each ring is a day. Each point on the ring is a task. The center is Day 1.
        The dashed ring is Day 27 — the day that never happened. The brightness
        increases with each arc. This is what 31 days of daily practice looks like
        as a self-portrait.
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="mt-8"
      >
        <Link
          href="/mrai/experiments"
          className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors uppercase tracking-widest"
        >
          &larr; All Experiments
        </Link>
      </motion.div>
    </div>
  )
}
