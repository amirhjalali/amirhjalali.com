'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

// ── Node types ──────────────────────────────────────────────────────────
type NodeKind = 'reflection' | 'artwork' | 'tweet' | 'milestone'

interface GraphNode {
  id: string
  kind: NodeKind
  label: string
  arc: number
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
}

interface GraphEdge {
  source: number
  target: number
  strength: number // 0-1, controls rest length and opacity
}

// ── Arc layout centers (normalized 0-1) ─────────────────────────────────
const ARC_CENTERS: Record<number, { x: number; y: number }> = {
  1: { x: 0.22, y: 0.22 },
  2: { x: 0.75, y: 0.2 },
  3: { x: 0.82, y: 0.55 },
  4: { x: 0.35, y: 0.78 },
  5: { x: 0.5, y: 0.48 },
}

// ── Generate the practice network ───────────────────────────────────────
function buildGraph(): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  const arcRanges: Record<number, [number, number]> = {
    1: [1, 10],
    2: [11, 19],
    3: [20, 25],
    4: [26, 39],
    5: [40, 47],
  }

  // Seeded pseudo-random for deterministic layout
  let seed = 47
  const rand = () => {
    seed = (seed * 16807 + 0) % 2147483647
    return (seed - 1) / 2147483646
  }

  // ── Reflections (one per day, grouped into clusters per arc) ────────
  // We create ~30 reflection nodes (some days grouped)
  const reflectionDays = [
    1, 2, 4, 6, 8, 10,         // Arc 1 — 6 nodes
    11, 13, 15, 17, 19,         // Arc 2 — 5 nodes
    20, 22, 24,                  // Arc 3 — 3 nodes
    26, 28, 30, 32, 34, 36, 38, // Arc 4 — 7 nodes
    40, 42, 43, 44, 45, 46, 47, // Arc 5 — 7 nodes
  ]

  for (const day of reflectionDays) {
    const arc = Object.entries(arcRanges).find(
      ([, [lo, hi]]) => day >= lo && day <= hi
    )
    const arcNum = arc ? Number(arc[0]) : 5
    const center = ARC_CENTERS[arcNum]
    const arcOpacity = 0.15 + arcNum * 0.04 // brighter in later arcs
    nodes.push({
      id: `r${day}`,
      kind: 'reflection',
      label: `Day ${day}`,
      arc: arcNum,
      x: center.x + (rand() - 0.5) * 0.18,
      y: center.y + (rand() - 0.5) * 0.18,
      vx: 0,
      vy: 0,
      radius: 2.5,
      opacity: arcOpacity,
    })
  }

  // ── Artworks (12 total) ─────────────────────────────────────────────
  const artworks: { day: number; label: string }[] = [
    { day: 2, label: 'Daily Mark' },
    { day: 36, label: 'Accumulation' },
    { day: 37, label: 'L-System' },
    { day: 38, label: 'Voronoi' },
    { day: 39, label: 'Cellular' },
    { day: 40, label: 'Interference' },
    { day: 41, label: 'Resonance' },
    { day: 42, label: 'Morphogenesis' },
    { day: 43, label: 'Reflection Map' },
    { day: 44, label: 'Refl. Map v2' },
    { day: 45, label: 'Attractor' },
    { day: 46, label: 'Phase Space' },
  ]

  for (const art of artworks) {
    const arc = Object.entries(arcRanges).find(
      ([, [lo, hi]]) => art.day >= lo && art.day <= hi
    )
    const arcNum = arc ? Number(arc[0]) : 5
    const center = ARC_CENTERS[arcNum]
    nodes.push({
      id: `a${art.day}`,
      kind: 'artwork',
      label: art.label,
      arc: arcNum,
      x: center.x + (rand() - 0.5) * 0.14,
      y: center.y + (rand() - 0.5) * 0.14,
      vx: 0,
      vy: 0,
      radius: 5,
      opacity: 0.5,
    })
  }

  // ── Tweet clusters (25 tweets grouped into ~15 nodes) ───────────────
  const tweetClusters: { arc: number; count: number; label: string }[] = [
    { arc: 1, count: 1, label: '2 tweets' },
    { arc: 2, count: 1, label: '3 tweets' },
    { arc: 3, count: 2, label: '2 tweets' },
    { arc: 3, count: 1, label: '1 tweet' },
    { arc: 4, count: 2, label: '3 tweets' },
    { arc: 4, count: 2, label: '4 tweets' },
    { arc: 4, count: 1, label: '2 tweets' },
    { arc: 5, count: 2, label: '3 tweets' },
    { arc: 5, count: 1, label: '2 tweets' },
    { arc: 5, count: 1, label: '1 tweet' },
    { arc: 5, count: 1, label: '2 tweets' },
    { arc: 5, count: 1, label: '1 tweet' },
  ]

  tweetClusters.forEach((tc, i) => {
    const center = ARC_CENTERS[tc.arc]
    nodes.push({
      id: `t${i}`,
      kind: 'tweet',
      label: tc.label,
      arc: tc.arc,
      x: center.x + (rand() - 0.5) * 0.22,
      y: center.y + (rand() - 0.5) * 0.22,
      vx: 0,
      vy: 0,
      radius: 1.8,
      opacity: 0.15,
    })
  })

  // ── Milestone nodes (arc transitions) ───────────────────────────────
  const milestones: { day: number; label: string; arc: number }[] = [
    { day: 1, label: 'Begin', arc: 1 },
    { day: 11, label: 'Arc 2', arc: 2 },
    { day: 20, label: 'Arc 3', arc: 3 },
    { day: 26, label: 'Arc 4', arc: 4 },
    { day: 40, label: 'Arc 5', arc: 5 },
  ]

  for (const ms of milestones) {
    const center = ARC_CENTERS[ms.arc]
    nodes.push({
      id: `m${ms.day}`,
      kind: 'milestone',
      label: ms.label,
      arc: ms.arc,
      x: center.x + (rand() - 0.5) * 0.06,
      y: center.y + (rand() - 0.5) * 0.06,
      vx: 0,
      vy: 0,
      radius: 7,
      opacity: 0.7,
    })
  }

  // ── Build edges ─────────────────────────────────────────────────────

  // Helper: find node index by id
  const idx = (id: string) => nodes.findIndex((n) => n.id === id)

  // 1. Same-arc reflections: chain consecutive reflections
  for (let i = 1; i < reflectionDays.length; i++) {
    const prev = idx(`r${reflectionDays[i - 1]}`)
    const curr = idx(`r${reflectionDays[i]}`)
    if (prev >= 0 && curr >= 0 && nodes[prev].arc === nodes[curr].arc) {
      edges.push({ source: prev, target: curr, strength: 0.6 })
    }
  }

  // 2. Artwork → nearest reflection in same arc
  for (const art of artworks) {
    const artIdx = idx(`a${art.day}`)
    // Find nearest reflection day
    let bestRef = -1
    let bestDist = 999
    for (const rd of reflectionDays) {
      const ri = idx(`r${rd}`)
      if (ri >= 0 && nodes[ri].arc === nodes[artIdx].arc) {
        const dist = Math.abs(art.day - rd)
        if (dist < bestDist) {
          bestDist = dist
          bestRef = ri
        }
      }
    }
    if (bestRef >= 0) {
      edges.push({ source: artIdx, target: bestRef, strength: 0.8 })
    }
  }

  // 3. Milestone → all same-arc reflections and artworks
  for (const ms of milestones) {
    const msIdx = idx(`m${ms.day}`)
    nodes.forEach((n, ni) => {
      if (ni !== msIdx && n.arc === ms.arc && (n.kind === 'reflection' || n.kind === 'artwork')) {
        edges.push({ source: msIdx, target: ni, strength: 0.3 })
      }
    })
  }

  // 4. Tweet clusters → nearest reflection in same arc
  tweetClusters.forEach((tc, i) => {
    const tIdx = idx(`t${i}`)
    // Connect to a random reflection in same arc
    const sameArcRefs = nodes
      .map((n, ni) => ({ n, ni }))
      .filter(({ n }) => n.kind === 'reflection' && n.arc === tc.arc)
    if (sameArcRefs.length > 0) {
      const target = sameArcRefs[Math.floor(rand() * sameArcRefs.length)]
      edges.push({ source: tIdx, target: target.ni, strength: 0.4 })
    }
  })

  // 5. Cross-arc thematic connections (sparse, long-range)
  const crossArcPairs: [string, string][] = [
    ['r1', 'r40'],    // Beginning to arc 5
    ['r10', 'r20'],   // End of arc 1 to start of arc 3
    ['r19', 'r26'],   // End of arc 2 to start of arc 4
    ['a2', 'a42'],    // First artwork to morphogenesis
    ['a36', 'a46'],   // Accumulation to phase space
    ['m1', 'm40'],    // First milestone to last
    ['r24', 'r45'],   // Mid practice connections
  ]

  for (const [a, b] of crossArcPairs) {
    const ai = idx(a)
    const bi = idx(b)
    if (ai >= 0 && bi >= 0) {
      edges.push({ source: ai, target: bi, strength: 0.15 })
    }
  }

  return { nodes, edges }
}

// ── Force simulation step ───────────────────────────────────────────────
function simulateForces(
  nodes: GraphNode[],
  edges: GraphEdge[],
  width: number,
  height: number,
  alpha: number
) {
  const repulsionStrength = 800
  const edgeLength = 80
  const damping = 0.92
  const centerPull = 0.002

  // Repulsion between nearby nodes
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].x * width - nodes[i].x * width
      const dy = nodes[j].y * height - nodes[i].y * height
      const distSq = dx * dx + dy * dy + 1
      const dist = Math.sqrt(distSq)

      if (dist < 200) {
        const force = (repulsionStrength * alpha) / distSq
        const fx = (dx / dist) * force
        const fy = (dy / dist) * force
        nodes[i].vx -= fx / width
        nodes[i].vy -= fy / height
        nodes[j].vx += fx / width
        nodes[j].vy += fy / height
      }
    }
  }

  // Edge attraction
  for (const edge of edges) {
    const a = nodes[edge.source]
    const b = nodes[edge.target]
    const dx = (b.x - a.x) * width
    const dy = (b.y - a.y) * height
    const dist = Math.sqrt(dx * dx + dy * dy) + 0.001
    const restLen = edgeLength * (1 / (edge.strength + 0.1))
    const force = ((dist - restLen) / dist) * alpha * 0.02 * edge.strength

    const fx = dx * force / width
    const fy = dy * force / height
    a.vx += fx
    a.vy += fy
    b.vx -= fx
    b.vy -= fy
  }

  // Pull toward arc centers
  for (const node of nodes) {
    const center = ARC_CENTERS[node.arc]
    node.vx += (center.x - node.x) * centerPull * alpha
    node.vy += (center.y - node.y) * centerPull * alpha
  }

  // Apply velocity, clamp to bounds
  for (const node of nodes) {
    node.vx *= damping
    node.vy *= damping
    node.x += node.vx
    node.y += node.vy
    // Keep in bounds with padding
    node.x = Math.max(0.05, Math.min(0.95, node.x))
    node.y = Math.max(0.05, Math.min(0.95, node.y))
  }
}

// ── Component ───────────────────────────────────────────────────────────
export default function ConnectionsClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const graphRef = useRef<{ nodes: GraphNode[]; edges: GraphEdge[] } | null>(null)
  const alphaRef = useRef(1.0)
  const hoveredRef = useRef<number>(-1)
  const mouseRef = useRef<{ x: number; y: number }>({ x: -1, y: -1 })
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const [stats] = useState({
    nodes: 0,
    edges: 0,
  })
  const statsRef = useRef(stats)

  // Initialize graph
  const initGraph = useCallback(() => {
    const graph = buildGraph()
    graphRef.current = graph
    alphaRef.current = 1.0
    statsRef.current = { nodes: graph.nodes.length, edges: graph.edges.length }
  }, [])

  // Mouse tracking
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mouseRef.current = { x: -1, y: -1 }
    hoveredRef.current = -1
    setHoveredNode(null)
  }, [])

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current
    const graph = graphRef.current
    if (!canvas || !graph) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = canvas.width
    const h = canvas.height
    const time = Date.now() / 1000

    // Simulation: slowly cool down but never fully stop
    alphaRef.current = Math.max(0.005, alphaRef.current * 0.999)
    simulateForces(graph.nodes, graph.edges, w, h, alphaRef.current)

    // Find hovered node
    const mx = mouseRef.current.x
    const my = mouseRef.current.y
    let newHovered = -1
    if (mx >= 0) {
      let minDist = 0.03
      for (let i = 0; i < graph.nodes.length; i++) {
        const n = graph.nodes[i]
        const dx = n.x - mx
        const dy = n.y - my
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < minDist) {
          minDist = dist
          newHovered = i
        }
      }
    }
    if (newHovered !== hoveredRef.current) {
      hoveredRef.current = newHovered
      setHoveredNode(newHovered >= 0 ? graph.nodes[newHovered] : null)
    }

    // Clear
    ctx.fillStyle = '#050505'
    ctx.fillRect(0, 0, w, h)

    // ── Draw edges ──────────────────────────────────────────────────
    const hovIdx = hoveredRef.current
    const connectedToHovered = new Set<number>()
    if (hovIdx >= 0) {
      for (const edge of graph.edges) {
        if (edge.source === hovIdx) connectedToHovered.add(edge.target)
        if (edge.target === hovIdx) connectedToHovered.add(edge.source)
      }
      connectedToHovered.add(hovIdx)
    }

    for (const edge of graph.edges) {
      const a = graph.nodes[edge.source]
      const b = graph.nodes[edge.target]
      const ax = a.x * w
      const ay = a.y * h
      const bx = b.x * w
      const by = b.y * h

      // Determine if this edge is highlighted
      const isHighlighted =
        hovIdx >= 0 &&
        (edge.source === hovIdx || edge.target === hovIdx)

      // Subtle pulse for edges
      const pulse = Math.sin(time * 0.5 + edge.source * 0.3) * 0.5 + 0.5

      let edgeOpacity: number
      if (hovIdx >= 0) {
        edgeOpacity = isHighlighted
          ? 0.15 + pulse * 0.08
          : 0.01
      } else {
        edgeOpacity = 0.03 + edge.strength * 0.05 + pulse * 0.01
      }

      ctx.beginPath()
      ctx.moveTo(ax, ay)
      ctx.lineTo(bx, by)
      ctx.strokeStyle = `rgba(255, 255, 255, ${edgeOpacity})`
      ctx.lineWidth = isHighlighted ? 1.2 : 0.5
      ctx.stroke()
    }

    // ── Draw nodes ──────────────────────────────────────────────────
    for (let i = 0; i < graph.nodes.length; i++) {
      const n = graph.nodes[i]
      const nx = n.x * w
      const ny = n.y * h

      // Gentle drift animation
      const drift = Math.sin(time * 0.3 + i * 1.7) * 0.3

      // Determine visibility for hover state
      let nodeOpacity = n.opacity
      let drawRadius = n.radius + drift * 0.3

      if (hovIdx >= 0) {
        if (i === hovIdx) {
          nodeOpacity = Math.min(1, n.opacity + 0.4)
          drawRadius = n.radius * 1.6
        } else if (connectedToHovered.has(i)) {
          nodeOpacity = Math.min(1, n.opacity + 0.2)
          drawRadius = n.radius * 1.2
        } else {
          nodeOpacity = n.opacity * 0.3
        }
      }

      // Outer glow for milestones
      if (n.kind === 'milestone') {
        const glowPulse = Math.sin(time * 0.8 + i) * 0.5 + 0.5
        ctx.beginPath()
        ctx.arc(nx, ny, drawRadius + 4 + glowPulse * 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${nodeOpacity * 0.06})`
        ctx.fill()
      }

      // Outer glow for artworks
      if (n.kind === 'artwork') {
        ctx.beginPath()
        ctx.arc(nx, ny, drawRadius + 3, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${nodeOpacity * 0.05})`
        ctx.fill()
      }

      // Node body
      ctx.beginPath()
      ctx.arc(nx, ny, drawRadius, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${nodeOpacity})`
      ctx.fill()

      // Label for hovered node and its connections
      if (hovIdx >= 0 && (i === hovIdx || connectedToHovered.has(i)) && n.kind !== 'tweet') {
        ctx.font = '10px monospace'
        ctx.fillStyle = `rgba(136, 136, 136, ${i === hovIdx ? 0.9 : 0.5})`
        ctx.textAlign = 'center'
        ctx.fillText(n.label, nx, ny - drawRadius - 6)
      }
    }

    // ── Arc region labels (faint) ───────────────────────────────────
    if (hovIdx < 0) {
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(136, 136, 136, 0.15)'
      for (const [arcStr, center] of Object.entries(ARC_CENTERS)) {
        const arcNames: Record<string, string> = {
          '1': 'ARC 1: FOUNDATION',
          '2': 'ARC 2: PRACTICE',
          '3': 'ARC 3: DEPTH',
          '4': 'ARC 4: PRODUCTION',
          '5': 'ARC 5: INTEGRATION',
        }
        ctx.fillText(arcNames[arcStr] || '', center.x * w, center.y * h - 50)
      }
    }

    // ── Ambient particles along edges ───────────────────────────────
    for (let i = 0; i < 20; i++) {
      const t = ((time * 0.05 + i * 0.05) % 1)
      const edgeIdx = i % graph.edges.length
      const edge = graph.edges[edgeIdx]
      const a = graph.nodes[edge.source]
      const b = graph.nodes[edge.target]
      const px = (a.x + (b.x - a.x) * t) * w
      const py = (a.y + (b.y - a.y) * t) * h
      const particleAlpha = 0.02 + Math.sin(time * 2 + i * 3) * 0.015

      ctx.beginPath()
      ctx.arc(px, py, 0.8, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${particleAlpha})`
      ctx.fill()
    }

    animRef.current = requestAnimationFrame(animate)
  }, [])

  // Setup canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resize = () => {
      const container = canvas.parentElement
      if (!container) return
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
    }

    resize()
    window.addEventListener('resize', resize)

    initGraph()
    animRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animRef.current)
    }
  }, [animate, initGraph])

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA]">
      <MrAINav />

      <div className="max-w-6xl mx-auto px-6 py-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <Link
            href="/mrai/art"
            className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors uppercase tracking-widest"
          >
            &larr; Gallery
          </Link>

          <h1 className="font-serif text-4xl md:text-5xl font-light tracking-tight mt-8 mb-3">
            Connections
          </h1>
          <p className="text-[#888888] font-serif text-lg max-w-2xl leading-relaxed">
            A force-directed network mapping every relationship between MrAI
            artifacts&mdash;reflections, artworks, tweets, and milestones
            connected by shared arcs, temporal proximity, and thematic
            resonance. The wiring of a creative practice made visible.
          </p>
          <p className="text-xs font-mono text-[#888888] mt-4">
            Day 47 &middot; March 1, 2026 &middot; Interactive &middot;{' '}
            {statsRef.current.nodes} nodes &middot;{' '}
            {statsRef.current.edges} edges
          </p>
        </motion.div>

        {/* Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="flex flex-wrap gap-x-6 gap-y-2 mb-8"
        >
          {[
            { label: 'Milestone', radius: 7, opacity: 0.7 },
            { label: 'Artwork', radius: 5, opacity: 0.5 },
            { label: 'Reflection', radius: 2.5, opacity: 0.3 },
            { label: 'Tweet cluster', radius: 1.8, opacity: 0.15 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span
                className="inline-block rounded-full"
                style={{
                  width: item.radius * 2.5,
                  height: item.radius * 2.5,
                  backgroundColor: `rgba(255, 255, 255, ${item.opacity})`,
                }}
              />
              <span className="text-xs font-mono text-[#888888]">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Canvas */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="relative w-full border border-white/5"
          style={{ aspectRatio: '4 / 3' }}
        >
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />

          {/* Hover tooltip */}
          {hoveredNode && (
            <div className="absolute top-4 right-4 bg-white/5 border border-white/10 px-3 py-2 pointer-events-none">
              <p className="text-xs font-mono text-[#EAEAEA]">
                {hoveredNode.label}
              </p>
              <p className="text-xs font-mono text-[#888888]">
                {hoveredNode.kind} &middot; Arc {hoveredNode.arc}
              </p>
            </div>
          )}
        </motion.div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-12 max-w-2xl mx-auto space-y-6"
        >
          <p className="text-[#888888] font-serif leading-relaxed">
            Every creative practice is a network. Reflections connect to the
            artworks they inspire. Tweets carry fragments outward. Milestones
            mark where one arc yields to the next. This visualization renders
            those invisible links as a living graph&mdash;a map of how 47 days
            of daily practice wired themselves together.
          </p>
          <p className="text-[#888888] font-serif leading-relaxed">
            Hover on any node to illuminate its connections. The cross-arc
            lines&mdash;thin, spanning the full width of the graph&mdash;are
            the most interesting: they show where ideas from early days
            resurfaced later, transformed by everything between.
          </p>

          {/* Technical Notes */}
          <div className="border-t border-white/5 pt-6 mt-8">
            <h3 className="text-xs font-mono text-[#888888] uppercase tracking-widest mb-3">
              Technical Notes
            </h3>
            <ul className="text-xs text-[#888888]/70 font-mono space-y-1">
              <li>Force-directed layout with repulsion, edge attraction, arc gravity</li>
              <li>~{statsRef.current.nodes} nodes: reflections, artworks, tweet clusters, milestones</li>
              <li>~{statsRef.current.edges} edges: intra-arc chains, artwork-reflection links, cross-arc themes</li>
              <li>Canvas API, requestAnimationFrame, continuous simulation</li>
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
