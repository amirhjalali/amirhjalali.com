'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, ZoomIn, ZoomOut, Maximize2, RefreshCw, Play, Pause } from 'lucide-react'

interface GraphNode {
  id: string
  label: string
  type: 'note' | 'topic'
  size: number
  x?: number
  y?: number
  vx?: number
  vy?: number
}

interface GraphEdge {
  source: string
  target: string
  weight: number
}

interface KnowledgeGraphProps {
  isOpen: boolean
  onClose: () => void
}

export default function KnowledgeGraph({ isOpen, onClose }: KnowledgeGraphProps) {
  const [nodes, setNodes] = useState<GraphNode[]>([])
  const [edges, setEdges] = useState<GraphEdge[]>([])
  const [loading, setLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [temperature, setTemperature] = useState(1.0)
  const [isPaused, setIsPaused] = useState(false)
  const [draggingNode, setDraggingNode] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const animationRef = useRef<number>(null)
  const temperatureRef = useRef(1.0)

  // Fetch graph data
  const fetchGraphData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notes/graph', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()

        // Initialize node positions randomly
        const width = 800
        const height = 600
        const initializedNodes = data.nodes.map((node: GraphNode) => ({
          ...node,
          x: Math.random() * width - width / 2,
          y: Math.random() * height - height / 2,
          vx: 0,
          vy: 0,
        }))

        setNodes(initializedNodes)
        setEdges(data.edges)
        // Reset temperature to start simulation fresh
        setTemperature(1.0)
        temperatureRef.current = 1.0
      }
    } catch (error) {
      console.error('Failed to fetch graph data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchGraphData()
    }
  }, [isOpen, fetchGraphData])

  // Force-directed simulation with temperature-based cooling
  useEffect(() => {
    if (nodes.length === 0) return

    const simulate = () => {
      // Check if simulation should be paused or has cooled down
      if (isPaused) {
        animationRef.current = requestAnimationFrame(simulate)
        return
      }

      // Cool down the temperature
      const newTemp = temperatureRef.current * 0.995
      temperatureRef.current = newTemp

      // Stop simulation if cooled enough (but keep loop for potential reheat)
      if (newTemp < 0.01 && !draggingNode) {
        animationRef.current = requestAnimationFrame(simulate)
        return
      }

      setNodes((prevNodes) => {
        const newNodes = prevNodes.map(n => ({ ...n }))

        // Node-node repulsion (scaled by temperature)
        for (let i = 0; i < newNodes.length; i++) {
          // Skip force calculations for dragged node
          if (newNodes[i].id === draggingNode) continue

          for (let j = i + 1; j < newNodes.length; j++) {
            if (newNodes[j].id === draggingNode) continue

            const dx = newNodes[j].x! - newNodes[i].x!
            const dy = newNodes[j].y! - newNodes[i].y!
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const force = (500 / (dist * dist)) * newTemp

            const fx = (dx / dist) * force
            const fy = (dy / dist) * force

            newNodes[i].vx! -= fx
            newNodes[i].vy! -= fy
            newNodes[j].vx! += fx
            newNodes[j].vy! += fy
          }
        }

        // Edge attraction (scaled by temperature)
        for (const edge of edges) {
          const sourceNode = newNodes.find((n) => n.id === edge.source)
          const targetNode = newNodes.find((n) => n.id === edge.target)

          if (sourceNode && targetNode) {
            // Skip if either node is being dragged
            if (sourceNode.id === draggingNode || targetNode.id === draggingNode) continue

            const dx = targetNode.x! - sourceNode.x!
            const dy = targetNode.y! - sourceNode.y!
            const dist = Math.sqrt(dx * dx + dy * dy) || 1
            const force = dist * 0.01 * edge.weight * newTemp

            const fx = (dx / dist) * force
            const fy = (dy / dist) * force

            sourceNode.vx! += fx
            sourceNode.vy! += fy
            targetNode.vx! -= fx
            targetNode.vy! -= fy
          }
        }

        // Center gravity (scaled by temperature)
        for (const node of newNodes) {
          if (node.id === draggingNode) continue
          node.vx! -= node.x! * 0.01 * newTemp
          node.vy! -= node.y! * 0.01 * newTemp
        }

        // Apply velocities with improved damping
        for (const node of newNodes) {
          if (node.id === draggingNode) continue

          node.vx! *= 0.7  // Faster settling (was 0.9)
          node.vy! *= 0.7

          // Stop micro-movements
          if (Math.abs(node.vx!) < 0.1) node.vx = 0
          if (Math.abs(node.vy!) < 0.1) node.vy = 0

          node.x! += node.vx!
          node.y! += node.vy!
        }

        return newNodes
      })

      // Update temperature state periodically for UI
      if (Math.random() < 0.1) {
        setTemperature(newTemp)
      }

      animationRef.current = requestAnimationFrame(simulate)
    }

    animationRef.current = requestAnimationFrame(simulate)

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [nodes.length, edges, isPaused, draggingNode])

  // Mouse handlers for panning and node dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsDragging(true)
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    setDraggingNode(nodeId)
    // Reheat simulation slightly when dragging
    temperatureRef.current = Math.max(temperatureRef.current, 0.3)
    setTemperature(temperatureRef.current)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingNode) {
      // Update dragged node position directly
      const rect = svgRef.current?.getBoundingClientRect()
      if (rect) {
        const newX = (e.clientX - rect.left - pan.x - rect.width / 2) / zoom
        const newY = (e.clientY - rect.top - pan.y - rect.height / 2) / zoom
        setNodes(prev => prev.map(n => {
          if (n.id === draggingNode) {
            return { ...n, x: newX, y: newY, vx: 0, vy: 0 }
          }
          return n
        }))
      }
    } else if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    if (draggingNode) {
      setDraggingNode(null)
      // Let simulation settle after dropping node
      temperatureRef.current = Math.max(temperatureRef.current, 0.2)
    }
  }

  // Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((z) => Math.max(0.1, Math.min(3, z * delta)))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 w-[90vw] h-[80vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-mono uppercase tracking-widest text-[#888888]">
            Knowledge Graph
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.min(3, z * 1.2))}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4 text-[#888888]" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(0.1, z * 0.8))}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4 text-[#888888]" />
            </button>
            <button
              onClick={() => {
                setZoom(1)
                setPan({ x: 0, y: 0 })
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Reset view"
            >
              <Maximize2 className="w-4 h-4 text-[#888888]" />
            </button>
            <button
              onClick={() => setIsPaused(p => !p)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title={isPaused ? "Resume simulation" : "Pause simulation"}
            >
              {isPaused ? (
                <Play className="w-4 h-4 text-[#888888]" />
              ) : (
                <Pause className="w-4 h-4 text-[#888888]" />
              )}
            </button>
            <button
              onClick={() => {
                fetchGraphData()
                temperatureRef.current = 1.0
                setTemperature(1.0)
              }}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 text-[#888888] ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-2"
            >
              <X className="w-4 h-4 text-[#888888]" />
            </button>
          </div>
        </div>

        {/* Graph Canvas */}
        <div className="flex-1 relative overflow-hidden">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-[#888888] animate-spin" />
            </div>
          ) : nodes.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-[#888888]">
              No graph data available. Process some notes first.
            </div>
          ) : (
            <svg
              ref={svgRef}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onWheel={handleWheel}
            >
              <g transform={`translate(${pan.x + 400}, ${pan.y + 300}) scale(${zoom})`}>
                {/* Edges */}
                {edges.map((edge, i) => {
                  const source = nodes.find((n) => n.id === edge.source)
                  const target = nodes.find((n) => n.id === edge.target)
                  if (!source || !target) return null

                  return (
                    <line
                      key={`edge-${i}`}
                      x1={source.x}
                      y1={source.y}
                      x2={target.x}
                      y2={target.y}
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth={Math.min(edge.weight, 3)}
                    />
                  )
                })}

                {/* Nodes */}
                {nodes.map((node) => (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
                    onClick={() => !draggingNode && setSelectedNode(node)}
                    className={`cursor-grab ${draggingNode === node.id ? 'cursor-grabbing' : ''}`}
                  >
                    <circle
                      r={node.size || 10}
                      fill={
                        draggingNode === node.id
                          ? 'rgba(255,255,255,0.4)'
                          : node.type === 'topic'
                          ? 'rgba(255,255,255,0.2)'
                          : 'rgba(255,255,255,0.1)'
                      }
                      stroke={
                        draggingNode === node.id
                          ? 'white'
                          : selectedNode?.id === node.id
                          ? 'white'
                          : 'rgba(255,255,255,0.3)'
                      }
                      strokeWidth={draggingNode === node.id || selectedNode?.id === node.id ? 2 : 1}
                      className="hover:fill-white/30 transition-colors"
                    />
                    <text
                      y={(node.size || 10) + 12}
                      textAnchor="middle"
                      fill="rgba(255,255,255,0.6)"
                      fontSize={10}
                      className="pointer-events-none select-none"
                    >
                      {node.label.length > 20 ? node.label.substring(0, 17) + '...' : node.label}
                    </text>
                  </g>
                ))}
              </g>
            </svg>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg p-3 text-xs">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-white/20 border border-white/30" />
              <span className="text-[#888888]">Topic</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-white/10 border border-white/30" />
              <span className="text-[#888888]">Note</span>
            </div>
          </div>

          {/* Selected Node Info */}
          {selectedNode && (
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg p-4 max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase text-[#888888]">
                  {selectedNode.type}
                </span>
                <button onClick={() => setSelectedNode(null)}>
                  <X className="w-4 h-4 text-[#888888]" />
                </button>
              </div>
              <p className="text-sm text-[#EAEAEA]">{selectedNode.label}</p>
              {selectedNode.type === 'note' && (
                <a
                  href={`/notes/${selectedNode.id.replace('note-', '')}`}
                  className="mt-2 text-xs text-[#888888] hover:text-[#EAEAEA] underline inline-block"
                >
                  View Note →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 p-3 border-t border-white/10 text-xs text-[#888888] font-mono">
          <span>{nodes.filter((n) => n.type === 'topic').length} topics</span>
          <span>{nodes.filter((n) => n.type === 'note').length} notes</span>
          <span>{edges.length} connections</span>
          {temperature > 0.01 && !isPaused && (
            <span className="text-[#666666]">settling...</span>
          )}
          <span className="ml-auto">Scroll to zoom • Drag nodes to move • Drag canvas to pan</span>
        </div>
      </div>
    </div>
  )
}
