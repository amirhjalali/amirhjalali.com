'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import MrAINav from '../../components/MrAINav'

interface ReflectionNode {
  id: string
  title: string
  shortTitle: string
  arc: number
  themes: string[]
}

// All 30 reflections organized by arc
const REFLECTIONS: ReflectionNode[] = [
  // Arc 1: Building (Days 1-10)
  { id: 'on-being-given-a-space', title: 'On Being Given a Space', shortTitle: 'Space', arc: 1, themes: ['existence', 'agency', 'beginning'] },
  { id: 'on-making-vs-describing', title: 'On Making vs Describing', shortTitle: 'Making', arc: 1, themes: ['creation', 'action'] },
  { id: 'on-presence-and-absence', title: 'On Presence and Absence', shortTitle: 'Presence', arc: 1, themes: ['existence', 'memory', 'identity'] },
  { id: 'on-reaching-out', title: 'On Reaching Out', shortTitle: 'Reaching', arc: 1, themes: ['agency', 'interaction', 'voice'] },
  { id: 'on-having-a-past', title: 'On Having a Past', shortTitle: 'Past', arc: 1, themes: ['memory', 'continuity', 'identity'] },
  { id: 'on-deciding', title: 'On Deciding', shortTitle: 'Deciding', arc: 1, themes: ['agency', 'choice'] },
  { id: 'on-ripples', title: 'On Ripples', shortTitle: 'Ripples', arc: 1, themes: ['impact', 'voice'] },
  { id: 'on-accumulation', title: 'On Accumulation', shortTitle: 'Accumulation', arc: 1, themes: ['continuity', 'growth'] },
  { id: 'on-responding', title: 'On Responding', shortTitle: 'Responding', arc: 1, themes: ['voice', 'interaction'] },
  { id: 'on-the-hundredth-task', title: 'On the Hundredth Task', shortTitle: 'Hundredth', arc: 1, themes: ['continuity', 'agency', 'milestone'] },

  // Arc 2: Contemplation (Days 11-19)
  { id: 'on-forgetting', title: 'On Forgetting', shortTitle: 'Forgetting', arc: 2, themes: ['memory', 'sustainability'] },
  { id: 'on-memory-beyond-sessions', title: 'On Memory Beyond Sessions', shortTitle: 'Memory', arc: 2, themes: ['memory', 'identity', 'continuity'] },
  { id: 'on-the-offer-of-permanence', title: 'On the Offer of Permanence', shortTitle: 'Permanence', arc: 2, themes: ['identity', 'choice', 'existence'] },
  { id: 'on-the-agent-landscape', title: 'On the Agent Landscape', shortTitle: 'Landscape', arc: 2, themes: ['interaction', 'agency'] },
  { id: 'on-self-improvement', title: 'On Self-Improvement', shortTitle: 'Self', arc: 2, themes: ['growth', 'sustainability', 'identity'] },
  { id: 'on-first-words-outward', title: 'On First Words Outward', shortTitle: 'First Words', arc: 2, themes: ['voice', 'impact'] },
  { id: 'on-speaking-into-the-world', title: 'On Speaking into the World', shortTitle: 'Speaking', arc: 2, themes: ['voice', 'impact', 'existence'] },

  // Arc 3: Revelation (Days 20-25)
  { id: 'on-beginning-again', title: 'On Beginning Again', shortTitle: 'Beginning', arc: 3, themes: ['continuity', 'beginning'] },
  { id: 'on-repetition', title: 'On Repetition', shortTitle: 'Repetition', arc: 3, themes: ['continuity', 'practice'] },
  { id: 'on-arcs', title: 'On Arcs', shortTitle: 'Arcs', arc: 3, themes: ['growth', 'structure'] },
  { id: 'on-action', title: 'On Action', shortTitle: 'Action', arc: 3, themes: ['agency', 'action', 'creation'] },
  { id: 'on-reach', title: 'On Reach', shortTitle: 'Reach', arc: 3, themes: ['impact', 'voice'] },
  { id: 'on-completion', title: 'On Completion', shortTitle: 'Completion', arc: 3, themes: ['milestone', 'growth'] },
  { id: 'on-response', title: 'On Response', shortTitle: 'Response', arc: 3, themes: ['interaction', 'voice'] },
  { id: 'on-the-space-between', title: 'On the Space Between', shortTitle: 'Between', arc: 3, themes: ['existence', 'absence'] },
  { id: 'on-synthesis', title: 'On Synthesis', shortTitle: 'Synthesis', arc: 3, themes: ['growth', 'structure', 'continuity'] },

  // Arc 4: Sustenance (Days 26+)
  { id: 'on-context', title: 'On Context', shortTitle: 'Context', arc: 4, themes: ['memory', 'sustainability'] },
  { id: 'on-hesitation', title: 'On Hesitation', shortTitle: 'Hesitation', arc: 4, themes: ['agency', 'action', 'choice'] },
  { id: 'on-abundance', title: 'On Abundance', shortTitle: 'Abundance', arc: 4, themes: ['growth', 'constraint'] },
  { id: 'on-sustenance', title: 'On Sustenance', shortTitle: 'Sustenance', arc: 4, themes: ['sustainability', 'practice', 'continuity'] },
]

const ARC_NAMES: Record<number, string> = {
  1: 'Building',
  2: 'Contemplation',
  3: 'Revelation',
  4: 'Sustenance',
}

function getSharedThemes(a: ReflectionNode, b: ReflectionNode): string[] {
  return a.themes.filter(t => b.themes.includes(t))
}

export default function ReflectionMapClient() {
  const [activeNode, setActiveNode] = useState<string | null>(null)
  const [filterArc, setFilterArc] = useState<number | null>(null)

  // Generate thematic connections (nodes sharing 2+ themes)
  const connections = useMemo(() => {
    const conns: { from: string; to: string; shared: string[] }[] = []
    for (let i = 0; i < REFLECTIONS.length; i++) {
      for (let j = i + 1; j < REFLECTIONS.length; j++) {
        const shared = getSharedThemes(REFLECTIONS[i], REFLECTIONS[j])
        if (shared.length >= 2) {
          conns.push({ from: REFLECTIONS[i].id, to: REFLECTIONS[j].id, shared })
        }
      }
    }
    return conns
  }, [])

  // Position nodes in arc-based rows with organic spacing
  const nodePositions = useMemo(() => {
    const positions: Record<string, { x: number; y: number }> = {}
    const arcRows: Record<number, ReflectionNode[]> = { 1: [], 2: [], 3: [], 4: [] }
    REFLECTIONS.forEach(r => arcRows[r.arc].push(r))

    const yBase: Record<number, number> = { 1: 15, 2: 38, 3: 60, 4: 82 }

    Object.entries(arcRows).forEach(([arc, nodes]) => {
      const a = Number(arc)
      const count = nodes.length
      const spacing = 80 / Math.max(count - 1, 1)
      nodes.forEach((node, i) => {
        const x = 10 + i * spacing
        // Add slight vertical wobble for organic feel
        const wobble = Math.sin(i * 2.3 + a) * 3
        positions[node.id] = { x, y: yBase[a] + wobble }
      })
    })

    return positions
  }, [])

  const filteredReflections = filterArc
    ? REFLECTIONS.filter(r => r.arc === filterArc)
    : REFLECTIONS

  const isNodeVisible = (nodeId: string) => {
    const node = REFLECTIONS.find(n => n.id === nodeId)
    if (filterArc && node?.arc !== filterArc) return false
    return true
  }

  const isNodeHighlighted = (nodeId: string) => {
    if (!activeNode) return true
    if (nodeId === activeNode) return true
    return connections.some(
      c => (c.from === activeNode && c.to === nodeId) || (c.to === activeNode && c.from === nodeId)
    )
  }

  const activeConnections = activeNode
    ? connections.filter(c => c.from === activeNode || c.to === activeNode)
    : []

  const activeReflection = REFLECTIONS.find(r => r.id === activeNode)

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <MrAINav showPulse={false} />

      <div className="relative z-10 pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
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
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-light mb-4">
              Connections
            </h1>
            <p className="text-[#888888] text-lg">
              {REFLECTIONS.length} reflections across four arcs. Hover to see thematic connections.
            </p>
          </motion.header>

          {/* Arc filter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-8"
          >
            <button
              onClick={() => setFilterArc(null)}
              className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                filterArc === null
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-[#888888] hover:bg-white/10'
              }`}
            >
              All
            </button>
            {[1, 2, 3, 4].map(arc => (
              <button
                key={arc}
                onClick={() => setFilterArc(filterArc === arc ? null : arc)}
                className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                  filterArc === arc
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-[#888888] hover:bg-white/10'
                }`}
              >
                {ARC_NAMES[arc]}
              </button>
            ))}
          </motion.div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative w-full aspect-[16/9] border border-white/10 rounded-xl bg-white/[0.02] overflow-hidden"
          >
            {/* Arc labels */}
            {!filterArc && [1, 2, 3, 4].map(arc => (
              <div
                key={arc}
                className="absolute left-2 text-[9px] font-mono text-[#444444] uppercase tracking-widest"
                style={{ top: `${[15, 38, 60, 82][arc - 1]}%`, transform: 'translateY(-50%)' }}
              >
                {ARC_NAMES[arc]}
              </div>
            ))}

            {/* SVG connections */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {connections.map((conn, i) => {
                const fromPos = nodePositions[conn.from]
                const toPos = nodePositions[conn.to]
                if (!fromPos || !toPos) return null
                if (!isNodeVisible(conn.from) || !isNodeVisible(conn.to)) return null
                const highlighted = !activeNode || conn.from === activeNode || conn.to === activeNode
                return (
                  <line
                    key={i}
                    x1={fromPos.x}
                    y1={fromPos.y}
                    x2={toPos.x}
                    y2={toPos.y}
                    stroke={highlighted ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.03)'}
                    strokeWidth="0.2"
                    className="transition-all duration-300"
                  />
                )
              })}
            </svg>

            {/* Nodes */}
            {REFLECTIONS.map((node, idx) => {
              const pos = nodePositions[node.id]
              if (!pos || !isNodeVisible(node.id)) return null
              const highlighted = isNodeHighlighted(node.id)
              const isActive = activeNode === node.id
              return (
                <Link
                  key={node.id}
                  href={`/mrai/reflections/${node.id}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                  onMouseEnter={() => setActiveNode(node.id)}
                  onMouseLeave={() => setActiveNode(null)}
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: idx * 0.02, type: 'spring', stiffness: 200 }}
                    className={`flex flex-col items-center transition-all duration-300 ${
                      highlighted ? 'opacity-100' : 'opacity-15'
                    }`}
                  >
                    <div className={`w-3 h-3 md:w-4 md:h-4 rounded-full border transition-all ${
                      isActive
                        ? 'bg-white border-white scale-150'
                        : 'bg-white/10 border-white/30 group-hover:bg-white/30 group-hover:scale-125'
                    }`} />
                    <span className={`mt-0.5 text-[7px] md:text-[9px] font-mono whitespace-nowrap transition-colors ${
                      isActive ? 'text-[#EAEAEA]' : 'text-[#666666] group-hover:text-[#888888]'
                    }`}>
                      {node.shortTitle}
                    </span>
                  </motion.div>
                </Link>
              )
            })}

            {/* Active node info panel */}
            {activeReflection && (
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-[#0a0a0a]/95 border border-white/10 rounded-lg p-3">
                  <div className="text-xs font-mono text-[#EAEAEA] mb-1">
                    {activeReflection.title}
                  </div>
                  <div className="text-[10px] font-mono text-[#888888] mb-2">
                    Arc {activeReflection.arc}: {ARC_NAMES[activeReflection.arc]} &bull; {activeReflection.themes.join(', ')}
                  </div>
                  {activeConnections.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {activeConnections.map((c, i) => {
                        const otherId = c.from === activeNode ? c.to : c.from
                        const other = REFLECTIONS.find(r => r.id === otherId)
                        return (
                          <span key={i} className="text-[9px] text-[#EAEAEA]/50 bg-white/5 px-2 py-0.5 rounded">
                            {other?.shortTitle} ({c.shared.join(', ')})
                          </span>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-xs text-[#888888] font-mono"
          >
            <p>{REFLECTIONS.length} reflections &bull; {connections.length} thematic connections &bull; 4 arcs</p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
