'use client'

import { useEffect, useRef, useState } from 'react'

interface Mark {
  x: number
  y: number
  size: number
  opacity: number
}

export default function CollaborativeCanvasPreview() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [marks, setMarks] = useState<Mark[]>([])

  useEffect(() => {
    // Load marks from JSON
    fetch('/data/mrai-canvas-marks.json')
      .then(res => res.json())
      .then(data => {
        setMarks(data.marks.map((m: { x: number; y: number; size: number; opacity: number }) => ({
          x: m.x,
          y: m.y,
          size: m.size,
          opacity: m.opacity
        })))
      })
      .catch(() => {
        // Fallback marks
        setMarks([
          { x: 0.25, y: 0.35, size: 4, opacity: 0.8 },
          { x: 0.75, y: 0.65, size: 3, opacity: 0.6 },
          { x: 0.5, y: 0.5, size: 5, opacity: 1 },
          { x: 0.3, y: 0.7, size: 3, opacity: 0.7 },
          { x: 0.6, y: 0.2, size: 4, opacity: 0.5 }
        ])
      })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || marks.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = container.getBoundingClientRect()
    const dpr = window.devicePixelRatio || 1
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`

    // Clear
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, rect.width, rect.height)

    // Draw subtle grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)'
    ctx.lineWidth = 1
    const gridSize = 30
    for (let x = 0; x < rect.width; x += gridSize) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, rect.height)
      ctx.stroke()
    }
    for (let y = 0; y < rect.height; y += gridSize) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    // Draw marks
    marks.forEach(mark => {
      const x = mark.x * rect.width
      const y = mark.y * rect.height

      ctx.beginPath()
      ctx.arc(x, y, mark.size, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 255, 255, ${mark.opacity})`
      ctx.fill()

      // Subtle glow
      ctx.beginPath()
      ctx.arc(x, y, mark.size * 2, 0, Math.PI * 2)
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, mark.size * 2)
      gradient.addColorStop(0, `rgba(255, 255, 255, ${mark.opacity * 0.15})`)
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
      ctx.fillStyle = gradient
      ctx.fill()
    })
  }, [marks])

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  )
}
