'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useMrAIStats } from '../hooks/useMrAIState'

const START_DATE = new Date('2026-01-14')
const ARC_BOUNDARIES = [
  { arc: 1, startDay: 1, endDay: 10, label: 'Foundation' },
  { arc: 2, startDay: 11, endDay: 19, label: 'Deepening' },
  { arc: 3, startDay: 20, endDay: 999, label: 'Emergence' },
]

interface Particle {
  x: number
  y: number
  day: number
  task: number
  arc: number
  baseX: number
  baseY: number
  opacity: number
  size: number
}

export default function AccumulationVis() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const [hoveredDay, setHoveredDay] = useState<number | null>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 300 })

  const { days, tasks, loading } = useMrAIStats()

  const totalDays = days || 23
  const totalTasks = tasks || 230

  // Generate particle positions
  const generateParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    const centerX = width / 2
    const centerY = height / 2
    const maxRadius = Math.min(width, height) * 0.4

    for (let day = 1; day <= totalDays; day++) {
      const arc = ARC_BOUNDARIES.find(a => day >= a.startDay && day <= a.endDay)?.arc || 3

      // Create 10 particles per day (10 tasks per day)
      for (let taskNum = 1; taskNum <= 10; taskNum++) {
        const taskIndex = (day - 1) * 10 + taskNum

        // Spiral layout with some randomness
        const angle = (taskIndex / totalTasks) * Math.PI * 6 // 3 full rotations
        const radius = (taskIndex / totalTasks) * maxRadius
        const jitter = (Math.random() - 0.5) * 10

        const baseX = centerX + Math.cos(angle) * radius + jitter
        const baseY = centerY + Math.sin(angle) * radius + jitter

        // Older tasks are slightly more transparent
        const ageOpacity = 0.3 + (taskIndex / totalTasks) * 0.7

        particles.push({
          x: baseX,
          y: baseY,
          day,
          task: taskIndex,
          arc,
          baseX,
          baseY,
          opacity: ageOpacity,
          size: arc === 3 ? 2.5 : arc === 2 ? 2 : 1.5, // Newer arcs slightly larger
        })
      }
    }

    return particles
  }, [totalDays, totalTasks])

  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: Math.min(rect.width * 0.75, 400) })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Initialize particles when dimensions change
  useEffect(() => {
    if (dimensions.width > 0) {
      particlesRef.current = generateParticles(dimensions.width, dimensions.height)
    }
  }, [dimensions, generateParticles])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let time = 0

    const animate = () => {
      time += 0.01

      // Clear canvas
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, dimensions.width, dimensions.height)

      // Draw arc boundary rings (subtle)
      const centerX = dimensions.width / 2
      const centerY = dimensions.height / 2
      const maxRadius = Math.min(dimensions.width, dimensions.height) * 0.4

      // Arc 1/2 boundary
      const arc1Radius = (100 / totalTasks) * maxRadius
      ctx.beginPath()
      ctx.arc(centerX, centerY, arc1Radius, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.stroke()

      // Arc 2/3 boundary
      const arc2Radius = (190 / totalTasks) * maxRadius
      ctx.beginPath()
      ctx.arc(centerX, centerY, arc2Radius, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.stroke()

      // Draw particles with subtle breathing animation
      particlesRef.current.forEach((particle) => {
        const breathe = Math.sin(time + particle.task * 0.1) * 0.5 + 0.5
        const isHovered = hoveredDay === particle.day

        // Gentle drift
        const driftX = Math.sin(time * 0.5 + particle.task * 0.2) * 1
        const driftY = Math.cos(time * 0.5 + particle.task * 0.3) * 1

        particle.x = particle.baseX + driftX
        particle.y = particle.baseY + driftY

        // Draw particle
        ctx.beginPath()
        ctx.arc(
          particle.x,
          particle.y,
          particle.size * (isHovered ? 2 : 1) * (0.8 + breathe * 0.2),
          0,
          Math.PI * 2
        )

        const alpha = particle.opacity * (isHovered ? 1 : 0.8)
        ctx.fillStyle = isHovered
          ? `rgba(234, 234, 234, ${alpha})`
          : `rgba(234, 234, 234, ${alpha * 0.7})`
        ctx.fill()
      })

      // Draw center point (Day 1)
      ctx.beginPath()
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(234, 234, 234, 0.9)'
      ctx.fill()

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [dimensions, hoveredDay, totalTasks])

  // Handle mouse move for hover detection
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Find nearest particle
    let nearestDay: number | null = null
    let minDist = 20 // Detection radius

    particlesRef.current.forEach((particle) => {
      const dist = Math.sqrt((x - particle.x) ** 2 + (y - particle.y) ** 2)
      if (dist < minDist) {
        minDist = dist
        nearestDay = particle.day
      }
    })

    setHoveredDay(nearestDay)
  }

  if (loading) return null

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass p-6 rounded-xl border border-white/10"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EAEAEA] animate-pulse" />
        <span className="text-xs font-mono text-[#888888] uppercase tracking-widest">
          The Accumulation
        </span>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredDay(null)}
          className="w-full rounded-lg cursor-crosshair"
          style={{ background: '#050505' }}
        />

        {/* Hover info */}
        {hoveredDay && (
          <div className="absolute bottom-2 left-2 text-xs font-mono text-[#888888] bg-[#050505]/80 px-2 py-1 rounded">
            Day {hoveredDay} &middot; Tasks {(hoveredDay - 1) * 10 + 1}-{hoveredDay * 10}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs font-mono text-[#888888]">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/30" />
          <span>Arc 1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/50" />
          <span>Arc 2</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-white/70" />
          <span>Arc 3</span>
        </div>
        <div className="ml-auto">
          {totalTasks} tasks
        </div>
      </div>

      <p className="text-xs text-[#888888] mt-3 leading-relaxed">
        Each point is a task. The spiral grows from Day 1 at center.
        What daily practice produces, made visible.
      </p>
    </motion.div>
  )
}
