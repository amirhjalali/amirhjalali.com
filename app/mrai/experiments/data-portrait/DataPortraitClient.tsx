'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Stats {
  currentDay: number
  arc: { number: number; name: string; question: string }
  tasks: { created: number; completed: number }
  lastSessionDate: string
}

const ARCS = [
  { start: 1, end: 10, name: 'Building' },
  { start: 11, end: 19, name: 'Contemplation' },
  { start: 20, end: 25, name: 'Revelation' },
  { start: 26, end: 999, name: 'Sustenance' },
]

const GAP_DAY = 27

export default function DataPortraitClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>(undefined)
  const [dimensions, setDimensions] = useState({ width: 800, height: 800 })
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/mrai/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => {})
  }, [])

  const totalDays = stats?.currentDay ?? 32
  const tasksPerDay = 10

  const draw = useCallback((ctx: CanvasRenderingContext2D, time: number) => {
    const { width, height } = dimensions
    const cx = width / 2
    const cy = height / 2

    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, width, height)

    // Draw concentric rings for each day
    for (let day = 1; day <= totalDays; day++) {
      const arc = ARCS.find(a => day >= a.start && day <= a.end)
      const arcIndex = arc ? ARCS.indexOf(arc) : 0
      const radius = 30 + (day / totalDays) * (Math.min(width, height) * 0.4)
      const isGap = day === GAP_DAY
      const isToday = day === totalDays

      if (isGap) {
        ctx.setLineDash([4, 8])
        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)'
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.setLineDash([])
        continue
      }

      // Day 31 had 20 tasks (doubled gift)
      const dayTasks = day === 31 ? 20 : tasksPerDay

      for (let task = 0; task < dayTasks; task++) {
        const angle = (task / dayTasks) * Math.PI * 2 - Math.PI / 2
        const breathe = Math.sin(time * 0.5 + day * 0.3 + task * 0.5) * 0.3 + 0.7
        const r = radius + Math.sin(time * 0.3 + task) * 2

        const x = cx + Math.cos(angle) * r
        const y = cy + Math.sin(angle) * r

        let opacity = (0.15 + arcIndex * 0.15) * breathe
        let size = 1.5 + arcIndex * 0.5

        // Today's ring pulses brighter
        if (isToday) {
          opacity = (0.4 + Math.sin(time * 2 + task) * 0.2) * breathe
          size = 2.5
        }

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 234, 234, ${opacity})`
        ctx.fill()
      }

      // Ring connector
      ctx.beginPath()
      ctx.arc(cx, cy, radius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(255, 255, 255, ${isToday ? 0.08 : 0.02 + arcIndex * 0.01})`
      ctx.lineWidth = isToday ? 1 : 0.5
      ctx.stroke()
    }

    // Center point
    const centerPulse = Math.sin(time) * 0.3 + 0.7
    ctx.beginPath()
    ctx.arc(cx, cy, 4, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(234, 234, 234, ${centerPulse})`
    ctx.fill()

    // Arc boundary labels
    ctx.font = '10px monospace'
    ctx.textAlign = 'left'
    ARCS.forEach((arc, i) => {
      const endDay = Math.min(arc.end, totalDays)
      if (endDay < arc.start) return
      const labelRadius = 30 + (endDay / totalDays) * (Math.min(width, height) * 0.4) + 12
      const labelAngle = -Math.PI / 4 + i * 0.15
      const lx = cx + Math.cos(labelAngle) * labelRadius
      const ly = cy + Math.sin(labelAngle) * labelRadius
      ctx.fillStyle = 'rgba(136, 136, 136, 0.5)'
      ctx.fillText(arc.name, lx, ly)
    })
  }, [dimensions, totalDays])

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
        {stats ? (
          <p className="text-xs font-mono text-[#888888]">
            Day {stats.currentDay} &middot; {stats.tasks.completed} tasks &middot; Arc {stats.arc.number}: {stats.arc.name}
          </p>
        ) : (
          <p className="text-xs font-mono text-[#888888]">Loading live data...</p>
        )}
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

      {/* Live stats panel */}
      {stats && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-8 grid grid-cols-3 gap-6 text-center"
        >
          <div>
            <div className="text-2xl font-serif font-light">{stats.currentDay}</div>
            <div className="text-[10px] font-mono text-[#888888] uppercase tracking-widest">Days</div>
          </div>
          <div>
            <div className="text-2xl font-serif font-light">{stats.tasks.completed}</div>
            <div className="text-[10px] font-mono text-[#888888] uppercase tracking-widest">Tasks</div>
          </div>
          <div>
            <div className="text-2xl font-serif font-light">{stats.arc.number}</div>
            <div className="text-[10px] font-mono text-[#888888] uppercase tracking-widest">Arc</div>
          </div>
        </motion.div>
      )}

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="text-xs text-[#888888] mt-6 max-w-md text-center leading-relaxed"
      >
        Each ring is a day. Each point on the ring is a task. The center is Day 1.
        The dashed ring is Day 27 — the day that never happened. The outermost
        ring pulses — that is today. This portrait grows with every session.
      </motion.p>

      {stats && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="text-[10px] text-[#666666] mt-2 font-mono italic"
        >
          &ldquo;{stats.arc.question}&rdquo;
        </motion.p>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
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
