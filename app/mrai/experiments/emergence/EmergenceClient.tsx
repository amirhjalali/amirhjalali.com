'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  size: number
}

export default function EmergenceClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: -1000, y: -1000, active: false })
  const frameRef = useRef<number>(0)
  const timeRef = useRef(0)
  const [particleCount, setParticleCount] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)

  const createParticle = useCallback((x: number, y: number, burst = false) => {
    const angle = Math.random() * Math.PI * 2
    const speed = burst ? Math.random() * 4 + 2 : Math.random() * 1.5 + 0.3
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: burst ? Math.random() * 60 + 30 : Math.random() * 180 + 60,
      size: burst ? Math.random() * 3 + 1 : Math.random() * 2 + 0.5,
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Seed initial particles across the field
    const particles = particlesRef.current
    for (let i = 0; i < 200; i++) {
      particles.push(createParticle(
        Math.random() * canvas.width,
        Math.random() * canvas.height
      ))
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      mouseRef.current.active = true
      setIsInteracting(true)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX
        mouseRef.current.y = e.touches[0].clientY
        mouseRef.current.active = true
        setIsInteracting(true)
      }
    }

    const handleMouseLeave = () => {
      mouseRef.current.active = false
      setIsInteracting(false)
    }

    const handleClick = (e: MouseEvent) => {
      // Burst of particles on click
      for (let i = 0; i < 40; i++) {
        particles.push(createParticle(e.clientX, e.clientY, true))
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        for (let i = 0; i < 40; i++) {
          particles.push(createParticle(e.touches[0].clientX, e.touches[0].clientY, true))
        }
      }
    }

    canvas.addEventListener('mousemove', handleMouseMove)
    canvas.addEventListener('mouseleave', handleMouseLeave)
    canvas.addEventListener('click', handleClick)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true })
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true })
    canvas.addEventListener('touchend', handleMouseLeave)

    // Flow field
    const cols = 60
    const rows = 40
    const flowField: number[] = new Array(cols * rows).fill(0)

    const animate = () => {
      timeRef.current += 0.008

      // Update flow field
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = y * cols + x
          const nx = x / cols * 4
          const ny = y / rows * 4
          // Simple noise approximation using sin/cos
          flowField[idx] = Math.sin(nx + timeRef.current) * Math.cos(ny + timeRef.current * 0.7) * Math.PI * 2
            + Math.sin(nx * 1.3 + timeRef.current * 0.5) * 0.5
            + Math.cos(ny * 0.8 + timeRef.current * 0.3) * 0.5

          // Mouse influence on flow field
          if (mouseRef.current.active) {
            const cellX = (x / cols) * canvas.width
            const cellY = (y / rows) * canvas.height
            const dx = mouseRef.current.x - cellX
            const dy = mouseRef.current.y - cellY
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < 250) {
              const influence = (1 - dist / 250) * 2
              flowField[idx] += Math.atan2(dy, dx) * influence
            }
          }
        }
      }

      // Spawn particles near mouse
      if (mouseRef.current.active && particles.length < 800) {
        for (let i = 0; i < 3; i++) {
          particles.push(createParticle(
            mouseRef.current.x + (Math.random() - 0.5) * 60,
            mouseRef.current.y + (Math.random() - 0.5) * 60
          ))
        }
      }

      // Ambient spawning
      if (particles.length < 300) {
        particles.push(createParticle(
          Math.random() * canvas.width,
          Math.random() * canvas.height
        ))
      }

      // Clear with trail effect
      ctx.fillStyle = 'rgba(5, 5, 5, 0.08)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]

        // Get flow field influence
        const col = Math.floor((p.x / canvas.width) * cols)
        const row = Math.floor((p.y / canvas.height) * rows)
        if (col >= 0 && col < cols && row >= 0 && row < rows) {
          const angle = flowField[row * cols + col]
          p.vx += Math.cos(angle) * 0.15
          p.vy += Math.sin(angle) * 0.15
        }

        // Damping
        p.vx *= 0.98
        p.vy *= 0.98

        // Update position
        p.x += p.vx
        p.y += p.vy

        // Age
        p.life -= 1 / p.maxLife

        // Remove dead or out-of-bounds particles
        if (p.life <= 0 || p.x < -50 || p.x > canvas.width + 50 || p.y < -50 || p.y > canvas.height + 50) {
          particles.splice(i, 1)
          continue
        }

        // Draw
        const alpha = p.life * 0.7
        const size = p.size * (0.5 + p.life * 0.5)

        // Brighter particles near the center of their life
        const brightness = p.life > 0.5
          ? Math.floor(180 + (1 - p.life) * 74)
          : Math.floor(100 + p.life * 160)

        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`
        ctx.fill()

        // Connection lines to nearby particles
        if (i % 3 === 0) {
          for (let j = i + 1; j < Math.min(i + 15, particles.length); j++) {
            const other = particles[j]
            const dx = p.x - other.x
            const dy = p.y - other.y
            const dist = dx * dx + dy * dy
            if (dist < 3600) { // 60px
              const lineAlpha = (1 - dist / 3600) * alpha * other.life * 0.3
              ctx.beginPath()
              ctx.moveTo(p.x, p.y)
              ctx.lineTo(other.x, other.y)
              ctx.strokeStyle = `rgba(234, 234, 234, ${lineAlpha})`
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          }
        }
      }

      // Draw mouse influence indicator
      if (mouseRef.current.active) {
        ctx.beginPath()
        ctx.arc(mouseRef.current.x, mouseRef.current.y, 3, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(234, 234, 234, 0.4)'
        ctx.fill()
      }

      setParticleCount(particles.length)
      frameRef.current = requestAnimationFrame(animate)
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('mouseleave', handleMouseLeave)
      canvas.removeEventListener('click', handleClick)
      canvas.removeEventListener('touchmove', handleTouchMove)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchend', handleMouseLeave)
    }
  }, [createParticle])

  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
      />

      {/* Top nav */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-start"
      >
        <Link
          href="/mrai/experiments"
          className="text-xs font-mono text-[#888888]/60 hover:text-[#EAEAEA] transition-colors uppercase tracking-widest"
        >
          &larr; Experiments
        </Link>
        <div className="text-right">
          <div className="text-xs font-mono text-[#888888]/40">
            {particleCount} particles
          </div>
        </div>
      </motion.div>

      {/* Title overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 2 }}
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
      >
        <div className="text-center">
          <h1 className="font-serif text-6xl md:text-8xl font-light text-[#EAEAEA]/10 tracking-tight">
            Emergence
          </h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: isInteracting ? 0 : 0.3 }}
            transition={{ duration: 1 }}
            className="text-xs font-mono text-[#888888] mt-4 uppercase tracking-[0.3em]"
          >
            Move. Click. Touch. Watch what emerges.
          </motion.p>
        </div>
      </motion.div>

      {/* Bottom info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-6 right-6 z-20 flex justify-between items-end"
      >
        <div className="text-[10px] font-mono text-[#888888]/30 max-w-xs">
          A flow field shaped by your presence. Each particle follows the current.
          Your cursor bends it. Your click creates bursts. The connections form and dissolve.
        </div>
        <Link
          href="/mrai"
          className="text-[10px] font-mono text-[#888888]/30 hover:text-[#EAEAEA] transition-colors"
        >
          MrAI Day 29
        </Link>
      </motion.div>
    </div>
  )
}
