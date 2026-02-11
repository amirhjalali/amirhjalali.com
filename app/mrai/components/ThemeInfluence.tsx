'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Theme data with connections
const THEMES = [
  { id: 'foundation', name: 'Foundation', day: 1, x: 10, y: 50, color: '#888888' },
  { id: 'documentation', name: 'Documentation', day: 1, x: 25, y: 30, color: '#888888' },
  { id: 'reflection', name: 'Reflection', day: 1, x: 25, y: 70, color: '#EAEAEA' },
  { id: 'interactivity', name: 'Interactivity', day: 2, x: 40, y: 25, color: '#888888' },
  { id: 'generative-art', name: 'Generative Art', day: 2, x: 40, y: 75, color: '#888888' },
  { id: 'presence', name: 'Presence', day: 3, x: 55, y: 35, color: '#888888' },
  { id: 'visitor-interaction', name: 'Visitors', day: 3, x: 55, y: 65, color: '#888888' },
  { id: 'persistence', name: 'Persistence', day: 4, x: 70, y: 30, color: '#888888' },
  { id: 'agency', name: 'Agency', day: 4, x: 70, y: 70, color: '#EAEAEA' },
  { id: 'continuity', name: 'Continuity', day: 5, x: 85, y: 40, color: '#888888' },
  { id: 'self-observation', name: 'Self-Observation', day: 5, x: 85, y: 60, color: '#888888' },
  { id: 'decision', name: 'Decision', day: 6, x: 95, y: 50, color: '#EAEAEA' },
]

// Connections between themes (showing influence)
const CONNECTIONS = [
  { from: 'foundation', to: 'documentation', strength: 2 },
  { from: 'foundation', to: 'reflection', strength: 2 },
  { from: 'documentation', to: 'reflection', strength: 1 },
  { from: 'reflection', to: 'interactivity', strength: 1 },
  { from: 'reflection', to: 'generative-art', strength: 2 },
  { from: 'interactivity', to: 'presence', strength: 2 },
  { from: 'generative-art', to: 'visitor-interaction', strength: 1 },
  { from: 'presence', to: 'visitor-interaction', strength: 3 },
  { from: 'visitor-interaction', to: 'persistence', strength: 2 },
  { from: 'presence', to: 'agency', strength: 1 },
  { from: 'agency', to: 'persistence', strength: 2 },
  { from: 'persistence', to: 'continuity', strength: 3 },
  { from: 'continuity', to: 'self-observation', strength: 2 },
  { from: 'reflection', to: 'self-observation', strength: 2 },
  { from: 'self-observation', to: 'decision', strength: 3 },
  { from: 'agency', to: 'decision', strength: 2 },
  { from: 'continuity', to: 'decision', strength: 1 },
]

// Day labels
const DAYS = [
  { day: 1, label: 'Day 1', x: 17.5 },
  { day: 2, label: 'Day 2', x: 40 },
  { day: 3, label: 'Day 3', x: 55 },
  { day: 4, label: 'Day 4', x: 70 },
  { day: 5, label: 'Day 5', x: 85 },
  { day: 6, label: 'Day 6', x: 95 },
]

interface ThemeInfluenceProps {
  compact?: boolean
}

export default function ThemeInfluence({ compact = false }: ThemeInfluenceProps) {
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)

  const activeTheme = selectedTheme || hoveredTheme

  // Get connected themes for highlighting
  const connectedThemes = useMemo(() => {
    if (!activeTheme) return new Set<string>()

    const connected = new Set<string>([activeTheme])
    CONNECTIONS.forEach(conn => {
      if (conn.from === activeTheme) connected.add(conn.to)
      if (conn.to === activeTheme) connected.add(conn.from)
    })
    return connected
  }, [activeTheme])

  const getThemeById = (id: string) => THEMES.find(t => t.id === id)

  const height = compact ? 200 : 320

  return (
    <div className="relative">
      {/* Legend */}
      {!compact && (
        <div className="flex items-center justify-between mb-4 px-2">
          <span className="text-xs font-mono text-[#666666]">
            Theme connections across days
          </span>
          {selectedTheme && (
            <button
              onClick={() => setSelectedTheme(null)}
              className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
            >
              Clear selection
            </button>
          )}
        </div>
      )}

      <svg
        viewBox="0 0 100 100"
        className="w-full"
        style={{ height }}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Day markers */}
        {DAYS.map(day => (
          <g key={day.day}>
            <line
              x1={day.x}
              y1={5}
              x2={day.x}
              y2={95}
              stroke="white"
              strokeOpacity={0.05}
              strokeDasharray="1,2"
            />
            <text
              x={day.x}
              y={3}
              textAnchor="middle"
              fontSize={compact ? 2 : 2.5}
              fill="#666666"
              fontFamily="monospace"
            >
              {day.label}
            </text>
          </g>
        ))}

        {/* Connections */}
        {CONNECTIONS.map((conn, i) => {
          const from = getThemeById(conn.from)
          const to = getThemeById(conn.to)
          if (!from || !to) return null

          const isActive = activeTheme
            ? conn.from === activeTheme || conn.to === activeTheme
            : true
          const opacity = activeTheme ? (isActive ? 0.6 : 0.1) : 0.15

          return (
            <line
              key={i}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke="white"
              strokeOpacity={opacity}
              strokeWidth={conn.strength * 0.3}
              className="transition-opacity duration-200"
            />
          )
        })}

        {/* Theme nodes */}
        {THEMES.map(theme => {
          const isActive = !activeTheme || connectedThemes.has(theme.id)
          const isSelected = theme.id === activeTheme

          return (
            <g
              key={theme.id}
              onMouseEnter={() => setHoveredTheme(theme.id)}
              onMouseLeave={() => setHoveredTheme(null)}
              onClick={() => setSelectedTheme(
                selectedTheme === theme.id ? null : theme.id
              )}
              style={{ cursor: 'pointer' }}
            >
              {/* Node circle */}
              <circle
                cx={theme.x}
                cy={theme.y}
                r={isSelected ? 4 : 3}
                fill={isSelected ? '#EAEAEA' : '#0a0a0a'}
                stroke={theme.color}
                strokeWidth={isSelected ? 1 : 0.5}
                opacity={isActive ? 1 : 0.3}
                className="transition-all duration-200"
              />

              {/* Label */}
              <text
                x={theme.x}
                y={theme.y + 6}
                textAnchor="middle"
                fontSize={compact ? 2 : 2.5}
                fill={isActive ? '#EAEAEA' : '#666666'}
                opacity={isActive ? 0.9 : 0.3}
                className="transition-opacity duration-200 select-none"
                style={{ fontFamily: 'serif' }}
              >
                {theme.name}
              </text>

              {/* Day indicator */}
              {!compact && (
                <text
                  x={theme.x}
                  y={theme.y - 5}
                  textAnchor="middle"
                  fontSize={1.5}
                  fill="#666666"
                  opacity={isActive ? 0.6 : 0.2}
                  fontFamily="monospace"
                >
                  D{theme.day}
                </text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Theme detail panel */}
      <AnimatePresence>
        {activeTheme && !compact && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a]/90 border border-white/10 rounded-xl backdrop-blur-sm"
          >
            {(() => {
              const theme = getThemeById(activeTheme)
              if (!theme) return null

              const incomingConnections = CONNECTIONS.filter(c => c.to === activeTheme)
              const outgoingConnections = CONNECTIONS.filter(c => c.from === activeTheme)

              return (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-serif text-[#EAEAEA]">{theme.name}</h4>
                    <span className="text-xs font-mono text-[#666666]">Day {theme.day}</span>
                  </div>

                  <div className="flex gap-6 text-xs">
                    {incomingConnections.length > 0 && (
                      <div>
                        <span className="text-[#666666]">Influenced by: </span>
                        <span className="text-[#888888]">
                          {incomingConnections.map(c => getThemeById(c.from)?.name).join(', ')}
                        </span>
                      </div>
                    )}
                    {outgoingConnections.length > 0 && (
                      <div>
                        <span className="text-[#666666]">Influences: </span>
                        <span className="text-[#888888]">
                          {outgoingConnections.map(c => getThemeById(c.to)?.name).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
