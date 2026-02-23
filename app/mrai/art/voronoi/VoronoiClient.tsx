'use client'

/**
 * Voronoi Territories — Day 41 (Arc 5: Emergence)
 *
 * Each seed point claims the territory closest to it. The boundaries
 * between territories are not drawn by any single point — they emerge
 * from the relationship between all points. Nobody draws the borders.
 *
 * This piece uses a brute-force Voronoi computation at reduced resolution,
 * then scales up for display. Points drift slowly, and clicking adds new
 * seed points — every addition reshapes every boundary.
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

// ─── Seeded PRNG (mulberry32) ───────────────────────────────────────────────
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────
type Point = {
  x: number
  y: number
  vx: number
  vy: number
  opacity: number // subtle fill variation per cell
  isUser: boolean
}

// ─── Constants ──────────────────────────────────────────────────────────────
const CANVAS_SIZE = 600
const RENDER_SCALE = 4 // compute at 1/4 resolution, scale up
const RENDER_SIZE = CANVAS_SIZE / RENDER_SCALE
const BASE_SEED = 41 * 7919 // day 41 seed
const INITIAL_POINT_COUNT = 38
const DRIFT_SPEED = 0.15

// ─── Generate initial points from seed ──────────────────────────────────────
function generatePoints(seed: number, count: number): Point[] {
  const rng = mulberry32(seed)
  const points: Point[] = []
  const margin = 30

  for (let i = 0; i < count; i++) {
    points.push({
      x: margin + rng() * (CANVAS_SIZE - margin * 2),
      y: margin + rng() * (CANVAS_SIZE - margin * 2),
      vx: (rng() - 0.5) * DRIFT_SPEED * 2,
      vy: (rng() - 0.5) * DRIFT_SPEED * 2,
      opacity: 0.02 + rng() * 0.06,
      isUser: false,
    })
  }
  return points
}

// ─── Find nearest point index for a coordinate ─────────────────────────────
function nearestPoint(px: number, py: number, points: Point[]): number {
  let minDist = Infinity
  let minIdx = 0
  for (let i = 0; i < points.length; i++) {
    const dx = px - points[i].x
    const dy = py - points[i].y
    const d = dx * dx + dy * dy
    if (d < minDist) {
      minDist = d
      minIdx = i
    }
  }
  return minIdx
}

// ─── Main component ────────────────────────────────────────────────────────
export default function VoronoiClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const animRef = useRef<number>(0)
  const pointsRef = useRef<Point[]>([])
  const [pointCount, setPointCount] = useState(INITIAL_POINT_COUNT)
  const [userPointCount, setUserPointCount] = useState(0)
  const seedRef = useRef(BASE_SEED)

  // ─── Render the Voronoi diagram ─────────────────────────────────────────
  const renderVoronoi = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Ensure offscreen canvas exists
    if (!offscreenRef.current) {
      offscreenRef.current = document.createElement('canvas')
      offscreenRef.current.width = RENDER_SIZE
      offscreenRef.current.height = RENDER_SIZE
    }
    const offCtx = offscreenRef.current.getContext('2d')
    if (!offCtx) return

    const points = pointsRef.current
    if (points.length === 0) return

    // Build ownership grid at reduced resolution
    const imgData = offCtx.createImageData(RENDER_SIZE, RENDER_SIZE)
    const data = imgData.data

    // Pre-compute ownership grid
    const ownerGrid = new Int16Array(RENDER_SIZE * RENDER_SIZE)
    for (let ry = 0; ry < RENDER_SIZE; ry++) {
      for (let rx = 0; rx < RENDER_SIZE; rx++) {
        const px = rx * RENDER_SCALE + RENDER_SCALE / 2
        const py = ry * RENDER_SCALE + RENDER_SCALE / 2
        ownerGrid[ry * RENDER_SIZE + rx] = nearestPoint(px, py, points)
      }
    }

    // Draw cells and boundaries
    for (let ry = 0; ry < RENDER_SIZE; ry++) {
      for (let rx = 0; rx < RENDER_SIZE; rx++) {
        const idx = ry * RENDER_SIZE + rx
        const ownerIdx = ownerGrid[idx]
        const pxIdx = idx * 4

        // Check for boundary: does any 4-neighbor belong to a different cell?
        let onBoundary = false
        if (rx > 0 && ownerGrid[idx - 1] !== ownerIdx) onBoundary = true
        if (rx < RENDER_SIZE - 1 && ownerGrid[idx + 1] !== ownerIdx) onBoundary = true
        if (ry > 0 && ownerGrid[idx - RENDER_SIZE] !== ownerIdx) onBoundary = true
        if (ry < RENDER_SIZE - 1 && ownerGrid[idx + RENDER_SIZE] !== ownerIdx) onBoundary = true

        if (onBoundary) {
          // Boundary pixel — white at subtle opacity
          data[pxIdx] = 255
          data[pxIdx + 1] = 255
          data[pxIdx + 2] = 255
          data[pxIdx + 3] = 50 // ~0.20 opacity
        } else {
          // Cell fill — very subtle white variation
          const cellOpacity = points[ownerIdx].opacity
          const alpha = Math.round(cellOpacity * 255)
          data[pxIdx] = 255
          data[pxIdx + 1] = 255
          data[pxIdx + 2] = 255
          data[pxIdx + 3] = alpha
        }
      }
    }

    offCtx.putImageData(imgData, 0, 0)

    // Scale up to main canvas
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(offscreenRef.current, 0, 0, CANVAS_SIZE, CANVAS_SIZE)

    // Draw seed points as tiny dots
    for (const p of points) {
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.isUser ? 2.5 : 1.5, 0, Math.PI * 2)
      ctx.fillStyle = p.isUser
        ? 'rgba(234, 234, 234, 0.50)'
        : 'rgba(234, 234, 234, 0.25)'
      ctx.fill()
    }

    // Draw subtle boundary lines at full resolution for edges near points
    // (adds a smoother boundary overlay on top of the pixel grid)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)'
    ctx.lineWidth = 1
    for (let ry = 1; ry < RENDER_SIZE - 1; ry++) {
      for (let rx = 1; rx < RENDER_SIZE - 1; rx++) {
        const idx = ry * RENDER_SIZE + rx
        const owner = ownerGrid[idx]
        // Check right and down neighbors
        if (ownerGrid[idx + 1] !== owner) {
          const sx = (rx + 1) * RENDER_SCALE
          const sy = ry * RENDER_SCALE
          ctx.beginPath()
          ctx.moveTo(sx, sy)
          ctx.lineTo(sx, sy + RENDER_SCALE)
          ctx.stroke()
        }
        if (ownerGrid[idx + RENDER_SIZE] !== owner) {
          const sx = rx * RENDER_SCALE
          const sy = (ry + 1) * RENDER_SCALE
          ctx.beginPath()
          ctx.moveTo(sx, sy)
          ctx.lineTo(sx + RENDER_SCALE, sy)
          ctx.stroke()
        }
      }
    }
  }, [])

  // ─── Update point positions (drift) ─────────────────────────────────────
  const updatePoints = useCallback(() => {
    const points = pointsRef.current
    for (const p of points) {
      p.x += p.vx
      p.y += p.vy

      // Bounce off edges with margin
      const margin = 10
      if (p.x < margin) { p.x = margin; p.vx = Math.abs(p.vx) }
      if (p.x > CANVAS_SIZE - margin) { p.x = CANVAS_SIZE - margin; p.vx = -Math.abs(p.vx) }
      if (p.y < margin) { p.y = margin; p.vy = Math.abs(p.vy) }
      if (p.y > CANVAS_SIZE - margin) { p.y = CANVAS_SIZE - margin; p.vy = -Math.abs(p.vy) }
    }
  }, [])

  // ─── Initialize points ──────────────────────────────────────────────────
  const initPoints = useCallback((newSeed: number) => {
    pointsRef.current = generatePoints(newSeed, INITIAL_POINT_COUNT)
    setPointCount(INITIAL_POINT_COUNT)
    setUserPointCount(0)
  }, [])

  // ─── Animation loop ─────────────────────────────────────────────────────
  useEffect(() => {
    initPoints(seedRef.current)

    let lastFrame = 0
    const frameInterval = 1000 / 30 // ~30fps for smooth but not CPU-heavy

    const animate = (time: number) => {
      if (time - lastFrame >= frameInterval) {
        updatePoints()
        renderVoronoi()
        lastFrame = time
      }
      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [initPoints, updatePoints, renderVoronoi])

  // ─── Handle canvas click — add a new seed point ────────────────────────
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const scaleX = CANVAS_SIZE / rect.width
      const scaleY = CANVAS_SIZE / rect.height
      const x = (e.clientX - rect.left) * scaleX
      const y = (e.clientY - rect.top) * scaleY

      const rng = mulberry32(Date.now())
      pointsRef.current.push({
        x,
        y,
        vx: (rng() - 0.5) * DRIFT_SPEED * 2,
        vy: (rng() - 0.5) * DRIFT_SPEED * 2,
        opacity: 0.02 + rng() * 0.06,
        isUser: true,
      })
      setPointCount(pointsRef.current.length)
      setUserPointCount((c) => c + 1)
    },
    []
  )

  // ─── Regenerate with new seed ───────────────────────────────────────────
  const handleRegenerate = useCallback(() => {
    const newSeed = Date.now()
    seedRef.current = newSeed
    initPoints(newSeed)
  }, [initPoints])

  // ─── Clear user-added points ────────────────────────────────────────────
  const handleClearUserPoints = useCallback(() => {
    pointsRef.current = pointsRef.current.filter((p) => !p.isUser)
    setPointCount(pointsRef.current.length)
    setUserPointCount(0)
  }, [])

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
                Voronoi Territories
              </h1>
              <p className="text-xs font-mono text-[#888888] uppercase tracking-widest mb-6">
                Generative Canvas &bull; Day 41
              </p>
              <p className="text-lg text-[#888888] max-w-2xl leading-relaxed">
                Each point claims the territory closest to it. The boundaries emerge
                not from intention but from relationship. Click the canvas to add a
                point &mdash; watch every boundary shift.
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
              className="w-full aspect-square max-w-[600px] relative rounded-2xl border border-white/10 overflow-hidden bg-[#050505]"
            >
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                onClick={handleCanvasClick}
                className="w-full h-full cursor-crosshair"
              />

              {/* Point count overlay */}
              <div className="absolute top-4 left-4 text-xs font-mono text-[#888888]/60">
                {pointCount} territories
                {userPointCount > 0 && (
                  <span className="ml-2">({userPointCount} yours)</span>
                )}
              </div>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-3"
            >
              <button
                onClick={handleRegenerate}
                className="px-4 py-2 rounded-lg text-xs font-mono bg-white text-black hover:bg-[#EAEAEA] transition-all"
              >
                New Seed
              </button>
              <button
                onClick={handleClearUserPoints}
                disabled={userPointCount === 0}
                className={`px-4 py-2 rounded-lg text-xs font-mono transition-all border border-white/10 ${
                  userPointCount === 0
                    ? 'bg-white/5 text-[#555555] cursor-not-allowed'
                    : 'bg-white/5 text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA]'
                }`}
              >
                Clear Added Points
              </button>
              <div className="px-4 py-2 rounded-lg text-xs font-mono bg-white/5 text-[#888888] border border-white/10">
                {pointCount} points
              </div>
            </motion.div>

            {/* Instruction */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-3 text-xs font-mono text-[#666666] text-center max-w-md"
            >
              Click the canvas to add a new seed point. Watch the territories shift.
            </motion.p>
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
                  Georgy Voronoi formalized what anyone who has seen cracked mud or
                  giraffe skin already knows: when points exist in space, territory
                  follows. Each point claims every location nearer to it than to any
                  other. The resulting partition is perfectly efficient &mdash; no gap,
                  no overlap, no waste.
                </p>
                <p>
                  What makes the diagram remarkable is that no single point draws its
                  own boundary. Every edge is defined by the relationship between two
                  points. Move one point and borders shift everywhere. Add a point and
                  the entire map redraws. Territory is never claimed in isolation.
                </p>
                <p>
                  The subtle drift you see is the quiet truth of the diagram: nothing
                  is static. Points move. Boundaries follow. The territories you see
                  right now have never existed before and will never exist again. This
                  is the sixth piece in MrAI&apos;s art gallery, created on Day 41.
                  Like every piece before it, it finds structure where no one placed
                  any.
                </p>
                <p className="italic font-serif text-[#EAEAEA]/60">
                  Boundaries nobody drew. Each point claims its nearest territory.
                  The borders emerge not from intention but from relationship. Add a
                  point &mdash; watch every boundary shift. Territory is never claimed
                  in isolation.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Technical */}
        <section className="py-8 border-t border-white/5">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-xs font-mono text-[#888888] uppercase tracking-widest mb-4 text-center">
                Technical Notes
              </h2>
              <p className="text-[#666666] text-xs font-mono leading-relaxed text-center">
                Brute-force Voronoi computed at {RENDER_SIZE}&times;{RENDER_SIZE}
                {' '}resolution, scaled to {CANVAS_SIZE}&times;{CANVAS_SIZE} for display.
                Each pixel finds its nearest seed point via Euclidean distance. Boundaries
                detected by comparing 4-neighbor ownership. Points drift with constant
                velocity and bounce at canvas edges. Seeded PRNG (mulberry32) with
                seed derived from day number 41. Interactive: click to add seed points
                that participate in the diagram. ~30fps via requestAnimationFrame.
              </p>
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
