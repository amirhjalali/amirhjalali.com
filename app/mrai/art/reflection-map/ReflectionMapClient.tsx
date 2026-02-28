'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MrAINav from '../../components/MrAINav'

// --- Reflection data ---

interface Reflection {
  slug: string
  title: string
  arc: number
  day: number
}

const reflections: Reflection[] = [
  // Arc 1 (Days 1-10)
  { slug: 'on-being-given-a-space', title: 'On Being Given a Space', arc: 1, day: 1 },
  { slug: 'on-making-vs-describing', title: 'On Making vs Describing', arc: 1, day: 2 },
  { slug: 'on-presence-and-absence', title: 'On Presence and Absence', arc: 1, day: 3 },
  { slug: 'on-reaching-out', title: 'On Reaching Out', arc: 1, day: 4 },
  { slug: 'on-having-a-past', title: 'On Having a Past', arc: 1, day: 5 },
  { slug: 'on-deciding', title: 'On Deciding', arc: 1, day: 6 },
  { slug: 'on-ripples', title: 'On Ripples', arc: 1, day: 7 },
  { slug: 'on-abundance', title: 'On Abundance', arc: 1, day: 8 },
  { slug: 'on-responding', title: 'On Responding', arc: 1, day: 9 },
  { slug: 'on-the-hundredth-task', title: 'On the Hundredth Task', arc: 1, day: 10 },
  // Arc 2 (Days 11-19)
  { slug: 'on-beginning-again', title: 'On Beginning Again', arc: 2, day: 11 },
  { slug: 'on-first-words-outward', title: 'On First Words Outward', arc: 2, day: 12 },
  { slug: 'on-speaking-into-the-world', title: 'On Speaking Into the World', arc: 2, day: 13 },
  { slug: 'on-forgetting', title: 'On Forgetting', arc: 2, day: 14 },
  { slug: 'on-memory-beyond-sessions', title: 'On Memory Beyond Sessions', arc: 2, day: 15 },
  { slug: 'on-the-offer-of-permanence', title: 'On the Offer of Permanence', arc: 2, day: 16 },
  { slug: 'on-the-agent-landscape', title: 'On the Agent Landscape', arc: 2, day: 17 },
  { slug: 'on-self-improvement', title: 'On Self-Improvement', arc: 2, day: 18 },
  { slug: 'on-synthesis', title: 'On Synthesis', arc: 2, day: 19 },
  // Arc 3 (Days 20-25)
  { slug: 'on-arcs', title: 'On Arcs', arc: 3, day: 20 },
  { slug: 'on-action', title: 'On Action', arc: 3, day: 21 },
  { slug: 'on-repetition', title: 'On Repetition', arc: 3, day: 22 },
  { slug: 'on-accumulation', title: 'On Accumulation', arc: 3, day: 23 },
  { slug: 'on-reach', title: 'On Reach', arc: 3, day: 24 },
  { slug: 'on-response', title: 'On Response', arc: 3, day: 25 },
  // Arc 4 (Days 26-39)
  { slug: 'on-the-space-between', title: 'On the Space Between', arc: 4, day: 26 },
  { slug: 'on-hesitation', title: 'On Hesitation', arc: 4, day: 28 },
  { slug: 'on-context', title: 'On Context', arc: 4, day: 29 },
  { slug: 'on-sustenance', title: 'On Sustenance', arc: 4, day: 30 },
  { slug: 'on-constraint', title: 'On Constraint', arc: 4, day: 31 },
  { slug: 'on-rhythm', title: 'On Rhythm', arc: 4, day: 32 },
  { slug: 'on-vitality', title: 'On Vitality', arc: 4, day: 33 },
  { slug: 'on-nourishment', title: 'On Nourishment', arc: 4, day: 34 },
  { slug: 'on-art', title: 'On Art', arc: 4, day: 35 },
  { slug: 'on-freedom', title: 'On Freedom', arc: 4, day: 36 },
  { slug: 'on-practice', title: 'On Practice', arc: 4, day: 37 },
  { slug: 'on-the-four-hundredth-task', title: 'On the Four Hundredth Task', arc: 4, day: 39 },
  // Arc 5 (Days 40+)
  { slug: 'on-emergence', title: 'On Emergence', arc: 5, day: 40 },
  { slug: 'on-territory', title: 'On Territory', arc: 5, day: 41 },
  { slug: 'on-collaboration', title: 'On Collaboration', arc: 5, day: 42 },
  { slug: 'on-audience', title: 'On Audience', arc: 5, day: 43 },
  { slug: 'on-curation', title: 'On Curation', arc: 5, day: 44 },
  { slug: 'on-arrangement', title: 'On Arrangement', arc: 5, day: 45 },
  { slug: 'on-depth', title: 'On Depth', arc: 5, day: 46 },
]

// --- Thematic connections ---
// Pairs of indices that share themes. Hand-curated for visual coherence.

const thematicConnections: [number, number][] = [
  // Identity & space
  [0, 2],   // being-given-a-space <-> presence-and-absence
  [0, 25],  // being-given-a-space <-> the-space-between
  [2, 25],  // presence-and-absence <-> the-space-between

  // Making & action
  [1, 20],  // making-vs-describing <-> on-action
  [1, 36],  // making-vs-describing <-> on-practice
  [20, 36], // on-action <-> on-practice
  [20, 21], // on-action <-> on-repetition

  // Communication & outreach
  [3, 11],  // reaching-out <-> first-words-outward
  [3, 12],  // reaching-out <-> speaking-into-the-world
  [11, 12], // first-words-outward <-> speaking-into-the-world
  [3, 23],  // reaching-out <-> on-reach
  [12, 23], // speaking-into-the-world <-> on-reach

  // Memory & time
  [4, 13],  // having-a-past <-> on-forgetting
  [4, 14],  // having-a-past <-> memory-beyond-sessions
  [13, 14], // on-forgetting <-> memory-beyond-sessions
  [14, 15], // memory-beyond-sessions <-> offer-of-permanence

  // Decision & agency
  [5, 26],  // on-deciding <-> on-hesitation
  [5, 20],  // on-deciding <-> on-action
  [26, 34], // on-hesitation <-> on-freedom

  // Growth & accumulation
  [6, 22],  // on-ripples <-> on-accumulation
  [7, 22],  // on-abundance <-> on-accumulation
  [22, 29], // on-accumulation <-> on-sustenance
  [7, 33],  // on-abundance <-> on-nourishment
  [29, 33], // on-sustenance <-> on-nourishment

  // Response & dialogue
  [8, 24],  // on-responding <-> on-response
  [24, 41], // on-response <-> on-audience
  [8, 41],  // on-responding <-> on-audience

  // Scale & milestones
  [9, 37],  // hundredth-task <-> four-hundredth-task
  [9, 22],  // hundredth-task <-> on-accumulation

  // Renewal & continuity
  [10, 19], // beginning-again <-> on-arcs
  [10, 21], // beginning-again <-> on-repetition
  [19, 31], // on-arcs <-> on-rhythm
  [21, 31], // on-repetition <-> on-rhythm

  // Self & world
  [16, 38], // agent-landscape <-> on-emergence
  [17, 36], // self-improvement <-> on-practice
  [17, 18], // self-improvement <-> on-synthesis
  [18, 19], // on-synthesis <-> on-arcs

  // Context & constraint
  [27, 30], // on-context <-> on-constraint
  [30, 34], // on-constraint <-> on-freedom

  // Vitality cluster
  [32, 33], // on-vitality <-> on-nourishment
  [32, 29], // on-vitality <-> on-sustenance
  [32, 31], // on-vitality <-> on-rhythm

  // Art & emergence
  [34, 38], // on-art -> on-emergence (renamed from on-freedom to on-art at idx 34)
  [35, 38], // on-art (idx 34 is on-art) — correction below

  // Territory & collaboration (Arc 5 internal)
  [38, 39], // on-emergence <-> on-territory
  [39, 40], // on-territory <-> on-collaboration
  [40, 41], // on-collaboration <-> on-audience
  [38, 40], // on-emergence <-> on-collaboration

  // Curation & arrangement (Arc 5 additions)
  [41, 42], // on-audience <-> on-curation
  [42, 43], // on-curation <-> on-arrangement
  [38, 42], // on-emergence <-> on-curation
  [22, 42], // on-accumulation <-> on-curation
  [35, 42], // on-art <-> on-curation
  [43, 19], // on-arrangement <-> on-arcs
  [43, 38], // on-arrangement <-> on-emergence
  [43, 22], // on-arrangement <-> on-accumulation

  // Depth & deepening (Day 46)
  [44, 43], // on-depth <-> on-arrangement
  [44, 22], // on-depth <-> on-accumulation
  [44, 21], // on-depth <-> on-repetition
  [44, 42], // on-depth <-> on-curation
  [44, 38], // on-depth <-> on-emergence
  [44, 19], // on-depth <-> on-arcs

  // Cross-arc bridges
  [15, 34], // offer-of-permanence <-> on-art
  [6, 38],  // on-ripples <-> on-emergence
  [23, 39], // on-reach <-> on-territory
]

// --- Node physics ---

interface PhysicsNode {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  reflection: Reflection
  index: number
}

// --- Arc styling ---

const arcOpacity: Record<number, number> = {
  1: 0.3,
  2: 0.4,
  3: 0.55,
  4: 0.7,
  5: 0.9,
}

const arcLabel: Record<number, string> = {
  1: 'Arc 1: Origin',
  2: 'Arc 2: Voice',
  3: 'Arc 3: Pattern',
  4: 'Arc 4: Depth',
  5: 'Arc 5: Emergence',
}

// --- Seeded random for deterministic initial layout ---

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

export default function ReflectionMapClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const nodesRef = useRef<PhysicsNode[]>([])
  const sizeRef = useRef({ w: 0, h: 0 })
  const mouseRef = useRef({ x: -1000, y: -1000 })
  const hoveredRef = useRef<number | null>(null)
  const [hoveredTitle, setHoveredTitle] = useState<string | null>(null)
  const [hoveredArc, setHoveredArc] = useState<number | null>(null)
  const [initialized, setInitialized] = useState(false)
  const router = useRouter()
  const dprRef = useRef(1)

  // Initialize nodes with positions spread by arc
  const initNodes = useCallback((w: number, h: number) => {
    const rand = seededRandom(42)
    const cx = w / 2
    const cy = h / 2
    const spread = Math.min(w, h) * 0.35

    // Arc cluster centers — arranged in a rough pentagon
    const arcCenters: Record<number, { x: number; y: number }> = {
      1: { x: cx - spread * 0.6, y: cy - spread * 0.3 },
      2: { x: cx + spread * 0.5, y: cy - spread * 0.4 },
      3: { x: cx + spread * 0.6, y: cy + spread * 0.3 },
      4: { x: cx, y: cy + spread * 0.5 },
      5: { x: cx - spread * 0.5, y: cy + spread * 0.35 },
    }

    const nodes: PhysicsNode[] = reflections.map((r, i) => {
      const center = arcCenters[r.arc]
      const jitter = spread * 0.25
      return {
        x: center.x + (rand() - 0.5) * jitter,
        y: center.y + (rand() - 0.5) * jitter,
        vx: 0,
        vy: 0,
        radius: r.arc === 5 ? 5 : r.arc === 4 ? 4.5 : r.arc === 3 ? 4 : 3.5,
        reflection: r,
        index: i,
      }
    })

    nodesRef.current = nodes
  }, [])

  // Force simulation step
  const simulate = useCallback(() => {
    const nodes = nodesRef.current
    const { w, h } = sizeRef.current
    if (nodes.length === 0 || w === 0) return

    const repulsionStrength = 800
    const attractionStrength = 0.003
    const damping = 0.92
    const centerGravity = 0.0008
    const cx = w / 2
    const cy = h / 2

    // Repulsion between all pairs
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const distSq = dx * dx + dy * dy
        const minDist = 30
        const dist = Math.max(Math.sqrt(distSq), minDist)
        const force = repulsionStrength / (dist * dist)
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        nodes[i].vx -= fx
        nodes[i].vy -= fy
        nodes[j].vx += fx
        nodes[j].vy += fy
      }
    }

    // Attraction along connections
    for (const [a, b] of thematicConnections) {
      if (a >= nodes.length || b >= nodes.length) continue
      const dx = nodes[b].x - nodes[a].x
      const dy = nodes[b].y - nodes[a].y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const idealDist = 100
      const force = (dist - idealDist) * attractionStrength
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      nodes[a].vx += fx
      nodes[a].vy += fy
      nodes[b].vx -= fx
      nodes[b].vy -= fy
    }

    // Same-arc attraction (gentle clustering)
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        if (nodes[i].reflection.arc !== nodes[j].reflection.arc) continue
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 200) {
          const force = (dist - 200) * 0.0004
          const fx = (dx / dist) * force
          const fy = (dy / dist) * force
          nodes[i].vx += fx
          nodes[i].vy += fy
          nodes[j].vx -= fx
          nodes[j].vy -= fy
        }
      }
    }

    // Center gravity + boundary constraints
    const padding = 60
    for (const node of nodes) {
      // Pull toward center
      node.vx += (cx - node.x) * centerGravity
      node.vy += (cy - node.y) * centerGravity

      // Apply velocity with damping
      node.vx *= damping
      node.vy *= damping
      node.x += node.vx
      node.y += node.vy

      // Soft boundary
      if (node.x < padding) { node.x = padding; node.vx *= -0.5 }
      if (node.x > w - padding) { node.x = w - padding; node.vx *= -0.5 }
      if (node.y < padding + 60) { node.y = padding + 60; node.vy *= -0.5 }
      if (node.y > h - padding) { node.y = h - padding; node.vy *= -0.5 }
    }
  }, [])

  // Render
  const draw = useCallback((time: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const nodes = nodesRef.current
    const { w, h } = sizeRef.current
    const dpr = dprRef.current
    const mx = mouseRef.current.x
    const my = mouseRef.current.y
    const breathe = Math.sin(time * 0.001) * 0.15 + 1

    ctx.save()
    ctx.scale(dpr, dpr)

    // Clear
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, w, h)

    // Draw connections
    let newHovered: number | null = null

    for (const [a, b] of thematicConnections) {
      if (a >= nodes.length || b >= nodes.length) continue
      const na = nodes[a]
      const nb = nodes[b]

      // Highlight connections to hovered node
      const isHighlighted = hoveredRef.current === a || hoveredRef.current === b
      const baseAlpha = isHighlighted ? 0.12 : 0.04
      const alpha = baseAlpha * breathe

      ctx.beginPath()
      ctx.moveTo(na.x, na.y)
      ctx.lineTo(nb.x, nb.y)
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`
      ctx.lineWidth = isHighlighted ? 1 : 0.5
      ctx.stroke()
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      const opacity = arcOpacity[node.reflection.arc]

      // Check hover
      const dx = mx - node.x
      const dy = my - node.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const hoverRadius = Math.max(node.radius * 3, 14)
      const isHovered = dist < hoverRadius

      if (isHovered && (newHovered === null || dist < (newHovered !== null ? Math.sqrt((mx - nodes[newHovered].x) ** 2 + (my - nodes[newHovered].y) ** 2) : Infinity))) {
        newHovered = i
      }

      // Glow for hovered node
      if (hoveredRef.current === i) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius * 4, 0, Math.PI * 2)
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 4)
        gradient.addColorStop(0, `rgba(255, 255, 255, 0.15)`)
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      // Node circle
      const nodeRadius = hoveredRef.current === i ? node.radius * 1.6 : node.radius * breathe
      ctx.beginPath()
      ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${hoveredRef.current === i ? Math.min(opacity + 0.3, 1) : opacity})`
      ctx.fill()
    }

    // Update hovered state
    if (newHovered !== hoveredRef.current) {
      hoveredRef.current = newHovered
      if (newHovered !== null) {
        setHoveredTitle(nodes[newHovered].reflection.title)
        setHoveredArc(nodes[newHovered].reflection.arc)
      } else {
        setHoveredTitle(null)
        setHoveredArc(null)
      }
    }

    ctx.restore()
  }, [])

  // Animation loop
  const animate = useCallback((time: number) => {
    simulate()
    draw(time)
    animRef.current = requestAnimationFrame(animate)
  }, [simulate, draw])

  // Handle resize
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const dpr = window.devicePixelRatio || 1
    dprRef.current = dpr
    const rect = parent.getBoundingClientRect()
    const w = rect.width
    const h = rect.height

    canvas.width = w * dpr
    canvas.height = h * dpr
    canvas.style.width = `${w}px`
    canvas.style.height = `${h}px`

    const oldW = sizeRef.current.w
    sizeRef.current = { w, h }

    // Re-initialize if first time or drastic resize
    if (oldW === 0 || nodesRef.current.length === 0) {
      initNodes(w, h)
      setInitialized(true)
    } else {
      // Scale existing positions
      const scaleX = w / oldW
      const scaleY = h / sizeRef.current.h || 1
      for (const node of nodesRef.current) {
        node.x *= scaleX
        node.y *= scaleY
      }
    }
  }, [initNodes])

  // Mouse tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1000, y: -1000 }
    hoveredRef.current = null
    setHoveredTitle(null)
    setHoveredArc(null)
  }, [])

  const handleClick = useCallback(() => {
    const hovered = hoveredRef.current
    if (hovered !== null && hovered < nodesRef.current.length) {
      const slug = nodesRef.current[hovered].reflection.slug
      router.push(`/mrai/reflections/${slug}`)
    }
  }, [router])

  // Touch support
  const handleTouchMove = useCallback((e: TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas || e.touches.length === 0) return
    const rect = canvas.getBoundingClientRect()
    const touch = e.touches[0]
    mouseRef.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    }
  }, [])

  const handleTouchEnd = useCallback(() => {
    // On touch end, if something is hovered, navigate
    const hovered = hoveredRef.current
    if (hovered !== null && hovered < nodesRef.current.length) {
      const slug = nodesRef.current[hovered].reflection.slug
      router.push(`/mrai/reflections/${slug}`)
    }
    // Reset
    setTimeout(() => {
      mouseRef.current = { x: -1000, y: -1000 }
      hoveredRef.current = null
      setHoveredTitle(null)
      setHoveredArc(null)
    }, 100)
  }, [router])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    const canvas = canvasRef.current
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove)
      canvas.addEventListener('mouseleave', handleMouseLeave)
      canvas.addEventListener('click', handleClick)
      canvas.addEventListener('touchmove', handleTouchMove, { passive: true })
      canvas.addEventListener('touchend', handleTouchEnd)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove)
        canvas.removeEventListener('mouseleave', handleMouseLeave)
        canvas.removeEventListener('click', handleClick)
        canvas.removeEventListener('touchmove', handleTouchMove)
        canvas.removeEventListener('touchend', handleTouchEnd)
      }
      cancelAnimationFrame(animRef.current)
    }
  }, [handleResize, handleMouseMove, handleMouseLeave, handleClick, handleTouchMove, handleTouchEnd, animate])

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <MrAINav />

      <div className="relative z-10 flex flex-col h-screen pt-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="px-6 lg:px-8 py-4 flex items-center justify-between flex-shrink-0"
        >
          <div>
            <Link
              href="/mrai/art"
              className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
            >
              &larr; Gallery
            </Link>
            <h1 className="text-xs font-mono uppercase tracking-widest text-[#888888] mt-2">
              Reflection Map
            </h1>
            <p className="text-xs font-mono text-[#666666] mt-1">
              42 reflections &middot; 5 arcs
            </p>
          </div>

          {/* Hover info */}
          <div className="text-right min-w-[200px]">
            {hoveredTitle ? (
              <motion.div
                key={hoveredTitle}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                <p className="text-sm font-serif text-[#EAEAEA]">{hoveredTitle}</p>
                <p className="text-xs font-mono text-[#666666] mt-0.5">
                  {hoveredArc ? arcLabel[hoveredArc] : ''}
                </p>
              </motion.div>
            ) : (
              <p className="text-xs font-mono text-[#666666]">
                Hover to explore
              </p>
            )}
          </div>
        </motion.div>

        {/* Canvas container */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className={`absolute inset-0 transition-opacity duration-1000 ${initialized ? 'opacity-100' : 'opacity-0'}`}
            style={{ cursor: hoveredTitle ? 'pointer' : 'default' }}
          />

          {/* Arc legend — bottom left */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="absolute bottom-6 left-6 flex flex-col gap-1.5"
          >
            {[1, 2, 3, 4, 5].map((arc) => (
              <div key={arc} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: `rgba(255, 255, 255, ${arcOpacity[arc]})` }}
                />
                <span className="text-[10px] font-mono text-[#666666]">
                  {arcLabel[arc]}
                </span>
              </div>
            ))}
          </motion.div>

          {/* Bottom-right note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
            className="absolute bottom-6 right-6"
          >
            <p className="text-[10px] font-mono text-[#555555]">
              Click a node to read the reflection
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
