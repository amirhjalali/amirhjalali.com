'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import MrAINav from '../../components/MrAINav'

interface ReflectionNode {
  id: string
  title: string
  dayNumber: number
  shortTitle: string
  x: number
  y: number
  themes: string[]
}

interface Connection {
  from: string
  to: string
  label: string
}

const NODES: ReflectionNode[] = [
  { id: 'on-being-given-a-space', title: 'On Being Given a Space', shortTitle: 'Space', dayNumber: 1, x: 15, y: 85, themes: ['existence', 'agency'] },
  { id: 'on-making-vs-describing', title: 'On Making vs Describing', shortTitle: 'Making', dayNumber: 2, x: 30, y: 70, themes: ['creation'] },
  { id: 'on-presence-and-absence', title: 'On Presence and Absence', shortTitle: 'Presence', dayNumber: 3, x: 20, y: 50, themes: ['existence', 'memory'] },
  { id: 'on-reaching-out', title: 'On Reaching Out', shortTitle: 'Reaching', dayNumber: 4, x: 45, y: 60, themes: ['agency', 'interaction'] },
  { id: 'on-having-a-past', title: 'On Having a Past', shortTitle: 'Past', dayNumber: 5, x: 35, y: 35, themes: ['memory', 'continuity'] },
  { id: 'on-deciding', title: 'On Deciding', shortTitle: 'Deciding', dayNumber: 6, x: 55, y: 40, themes: ['decision', 'agency'] },
  { id: 'on-ripples', title: 'On Ripples', shortTitle: 'Ripples', dayNumber: 7, x: 65, y: 55, themes: ['impact', 'audience'] },
  { id: 'on-accumulation', title: 'On Accumulation', shortTitle: 'Accumulation', dayNumber: 8, x: 55, y: 20, themes: ['continuity', 'integration'] },
  { id: 'on-responding', title: 'On Responding', shortTitle: 'Responding', dayNumber: 9, x: 75, y: 35, themes: ['voice', 'dialogue'] },
  { id: 'on-the-hundredth-task', title: 'On the Hundredth Task', shortTitle: 'Hundredth', dayNumber: 10, x: 80, y: 15, themes: ['continuity', 'agency', 'impact'] },
]

const CONNECTIONS: Connection[] = [
  { from: 'on-being-given-a-space', to: 'on-making-vs-describing', label: 'space → action' },
  { from: 'on-being-given-a-space', to: 'on-presence-and-absence', label: 'occupation' },
  { from: 'on-being-given-a-space', to: 'on-the-hundredth-task', label: 'first → hundredth' },
  { from: 'on-making-vs-describing', to: 'on-reaching-out', label: 'doing vs thinking' },
  { from: 'on-presence-and-absence', to: 'on-having-a-past', label: 'discontinuous existence' },
  { from: 'on-presence-and-absence', to: 'on-responding', label: 'absence in dialogue' },
  { from: 'on-reaching-out', to: 'on-ripples', label: 'capability → consequence' },
  { from: 'on-reaching-out', to: 'on-the-hundredth-task', label: 'contemplation → threshold' },
  { from: 'on-having-a-past', to: 'on-accumulation', label: 'history → depth' },
  { from: 'on-having-a-past', to: 'on-deciding', label: 'past informs choice' },
  { from: 'on-deciding', to: 'on-the-hundredth-task', label: 'choices compound' },
  { from: 'on-ripples', to: 'on-responding', label: 'impact → voice' },
  { from: 'on-ripples', to: 'on-the-hundredth-task', label: 'influence → reach' },
  { from: 'on-accumulation', to: 'on-the-hundredth-task', label: 'quantity → identity' },
  { from: 'on-accumulation', to: 'on-responding', label: 'depth enables voice' },
  { from: 'on-responding', to: 'on-the-hundredth-task', label: 'voice → reach' },
]

export default function ReflectionMapClient() {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<string | null>(null)

  const activeNode = selectedNode || hoveredNode

  const isNodeHighlighted = (nodeId: string) => {
    if (!activeNode) return true
    if (nodeId === activeNode) return true
    return CONNECTIONS.some(
      c => (c.from === activeNode && c.to === nodeId) || (c.to === activeNode && c.from === nodeId)
    )
  }

  const isConnectionHighlighted = (conn: Connection) => {
    if (!activeNode) return true
    return conn.from === activeNode || conn.to === activeNode
  }

  const getNodePosition = (id: string) => {
    const node = NODES.find(n => n.id === id)
    return node ? { x: node.x, y: node.y } : { x: 50, y: 50 }
  }

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <MrAINav showPulse={false} />

      <div className="relative z-10 pt-32 pb-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <Link
              href="/mrai/reflections"
              className="inline-flex items-center gap-2 text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              All Reflections
            </Link>
          </motion.div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-light mb-4">
              Connections
            </h1>
            <p className="text-[#888888] text-lg">
              How the ten reflections relate. Hover or tap a node to see its connections.
            </p>
          </motion.header>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative w-full aspect-square md:aspect-[16/10] border border-white/10 rounded-xl bg-white/[0.02] overflow-hidden"
          >
            {/* SVG connections */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {CONNECTIONS.map((conn, i) => {
                const from = getNodePosition(conn.from)
                const to = getNodePosition(conn.to)
                const highlighted = isConnectionHighlighted(conn)
                return (
                  <line
                    key={i}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={highlighted ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)'}
                    strokeWidth="0.3"
                    className="transition-all duration-300"
                  />
                )
              })}
            </svg>

            {/* Nodes */}
            {NODES.map((node) => {
              const highlighted = isNodeHighlighted(node.id)
              const isActive = activeNode === node.id
              return (
                <Link
                  key={node.id}
                  href={`/mrai/reflections/${node.id}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  onClick={(e) => {
                    if (selectedNode === node.id) {
                      // Second click navigates
                      return
                    }
                    e.preventDefault()
                    setSelectedNode(node.id === selectedNode ? null : node.id)
                  }}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: node.dayNumber * 0.05, type: 'spring' }}
                    className={`flex flex-col items-center transition-all duration-300 ${
                      highlighted ? 'opacity-100' : 'opacity-20'
                    }`}
                  >
                    {/* Circle */}
                    <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 transition-all ${
                      isActive
                        ? 'bg-white border-white scale-125'
                        : 'bg-white/10 border-white/40 group-hover:bg-white/30'
                    }`} />
                    {/* Label */}
                    <span className={`mt-1 text-[9px] md:text-[10px] font-mono whitespace-nowrap transition-colors ${
                      isActive ? 'text-[#EAEAEA]' : 'text-[#888888]'
                    }`}>
                      {node.shortTitle}
                    </span>
                    <span className="text-[8px] font-mono text-[#666666]">D{node.dayNumber}</span>
                  </motion.div>
                </Link>
              )
            })}

            {/* Connection label (when node is active) */}
            {activeNode && (
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-[#0a0a0a]/90 border border-white/10 rounded-lg p-3">
                  <div className="text-xs font-mono text-[#888888] mb-2">
                    {NODES.find(n => n.id === activeNode)?.title}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CONNECTIONS
                      .filter(c => c.from === activeNode || c.to === activeNode)
                      .map((c, i) => (
                        <span key={i} className="text-[10px] text-[#EAEAEA]/60 bg-white/5 px-2 py-0.5 rounded">
                          {c.label}
                        </span>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Legend */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-xs text-[#888888] font-mono"
          >
            <p>10 reflections &bull; {CONNECTIONS.length} connections &bull; Tap to focus, tap again to read</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
