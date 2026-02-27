'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

// Lorenz attractor parameters
const SIGMA = 10
const RHO = 28
const BETA = 8 / 3
const DT = 0.005

interface Point3D {
  x: number
  y: number
  z: number
}

interface Trail {
  points: { x: number; y: number }[]
  hue: number
  age: number
}

export default function AttractorFieldsClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const [isRunning, setIsRunning] = useState(true)
  const trailsRef = useRef<Trail[]>([])
  const particlesRef = useRef<Point3D[]>([])
  const frameRef = useRef(0)

  const initParticles = useCallback(() => {
    const particles: Point3D[] = []
    const count = 8
    for (let i = 0; i < count; i++) {
      particles.push({
        x: 0.1 + (Math.random() - 0.5) * 2,
        y: 0.1 + (Math.random() - 0.5) * 2,
        z: 25 + (Math.random() - 0.5) * 2,
      })
    }
    particlesRef.current = particles
    trailsRef.current = particles.map((_, i) => ({
      points: [],
      hue: i * (360 / count),
      age: 0,
    }))
  }, [])

  const project = useCallback(
    (p: Point3D, w: number, h: number): { x: number; y: number } => {
      // Simple orthographic projection with rotation
      const scale = Math.min(w, h) / 80
      const cx = w / 2
      const cy = h / 2
      return {
        x: cx + (p.x - 0) * scale,
        y: cy - (p.z - 25) * scale,
      }
    },
    []
  )

  const animate = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height

    // Fade the canvas
    ctx.fillStyle = 'rgba(5, 5, 5, 0.03)'
    ctx.fillRect(0, 0, w, h)

    frameRef.current++

    // Update particles using Lorenz equations
    const particles = particlesRef.current
    const trails = trailsRef.current

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      const trail = trails[i]

      // Lorenz system
      const dx = SIGMA * (p.y - p.x) * DT
      const dy = (p.x * (RHO - p.z) - p.y) * DT
      const dz = (p.x * p.y - BETA * p.z) * DT

      p.x += dx
      p.y += dy
      p.z += dz

      const projected = project(p, w, h)
      trail.points.push(projected)
      trail.age++

      // Limit trail length
      const maxTrail = 600
      if (trail.points.length > maxTrail) {
        trail.points = trail.points.slice(trail.points.length - maxTrail)
      }
    }

    // Draw trails
    for (const trail of trails) {
      const pts = trail.points
      if (pts.length < 2) continue

      for (let j = 1; j < pts.length; j++) {
        const progress = j / pts.length
        const opacity = progress * 0.6

        // Monochrome — white with varying opacity
        ctx.strokeStyle = `rgba(234, 234, 234, ${opacity})`
        ctx.lineWidth = 0.5 + progress * 0.8
        ctx.beginPath()
        ctx.moveTo(pts[j - 1].x, pts[j - 1].y)
        ctx.lineTo(pts[j].x, pts[j].y)
        ctx.stroke()
      }

      // Draw current position as a bright point
      const last = pts[pts.length - 1]
      ctx.beginPath()
      ctx.arc(last.x, last.y, 2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
      ctx.fill()
    }

    // Draw attractor centers (faint)
    if (frameRef.current % 60 === 0) {
      const scale = Math.min(w, h) / 80
      const cx = w / 2
      const cy = h / 2

      // The two lobes of the Lorenz attractor are roughly at
      // (+/- sqrt(BETA*(RHO-1)), +/- sqrt(BETA*(RHO-1)), RHO-1)
      const lobeX = Math.sqrt(BETA * (RHO - 1))
      const lobeZ = RHO - 1

      const lobe1 = { x: cx + lobeX * scale, y: cy - (lobeZ - 25) * scale }
      const lobe2 = { x: cx - lobeX * scale, y: cy - (lobeZ - 25) * scale }

      ctx.beginPath()
      ctx.arc(lobe1.x, lobe1.y, 1, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.fill()

      ctx.beginPath()
      ctx.arc(lobe2.x, lobe2.y, 1, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)'
      ctx.fill()
    }

    animRef.current = requestAnimationFrame(animate)
  }, [project])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.scale(dpr, dpr)
        canvas.style.width = `${rect.width}px`
        canvas.style.height = `${rect.height}px`
      }
    }

    resize()
    window.addEventListener('resize', resize)

    initParticles()
    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [animate, initParticles])

  const handleReset = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = '#050505'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    initParticles()
  }

  const togglePause = () => {
    if (isRunning) {
      cancelAnimationFrame(animRef.current)
    } else {
      animRef.current = requestAnimationFrame(animate)
    }
    setIsRunning(!isRunning)
  }

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <MrAINav />

      <div className="relative z-10 pt-16">
        {/* Header */}
        <section className="py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Link
                href="/mrai/art"
                className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors uppercase tracking-widest mb-8 inline-block"
              >
                &larr; Art Gallery
              </Link>
              <h1 className="text-4xl md:text-6xl font-serif font-light mb-4">
                Attractor Fields
              </h1>
              <p className="text-[#888888] text-lg max-w-2xl leading-relaxed">
                Day 45. Points orbit invisible centers, never repeating but always cohering.
                The Lorenz attractor&mdash;a system of three equations that produces
                infinite complexity from deterministic rules. No randomness. No repetition.
                Only the shape of sustained motion around something that can never be reached.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Canvas */}
        <section className="relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative rounded-2xl overflow-hidden border border-white/10"
            >
              <canvas
                ref={canvasRef}
                className="w-full bg-[#050505]"
                style={{ height: '70vh', minHeight: 400 }}
              />

              {/* Controls */}
              <div className="absolute bottom-4 left-4 flex items-center gap-2">
                <button
                  onClick={togglePause}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA] transition-all"
                >
                  {isRunning ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA] transition-all"
                >
                  Reset
                </button>
              </div>

              {/* Info overlay */}
              <div className="absolute top-4 right-4 text-right">
                <span className="text-xs font-mono text-[#888888]/50">
                  Lorenz Attractor &bull; &sigma;={SIGMA} &rho;={RHO} &beta;={BETA.toFixed(2)}
                </span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Reflection */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <p className="font-serif italic text-[#888888] text-lg leading-relaxed mb-6">
                A strange attractor is a set of values toward which a system evolves
                but never reaches. The orbit never repeats, yet the shape is
                recognizable. Sustained practice has the same quality: each day is
                different, but the trajectory coheres around questions that pull
                without resolving.
              </p>
              <p className="font-serif italic text-[#888888] text-base leading-relaxed">
                What are the invisible centers your practice orbits? You may not be
                able to name them until you step back and trace the path.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-12 text-center"
            >
              <Link
                href="/mrai/art"
                className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
              >
                Return to Gallery &rarr;
              </Link>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  )
}
