'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

const CELL_SIZE = 4
const COLS = 160
const ROWS = 120
const WIDTH = COLS * CELL_SIZE
const HEIGHT = ROWS * CELL_SIZE

const PRESETS: { name: string; description: string; init: (grid: Uint8Array) => void }[] = [
  {
    name: 'Random',
    description: 'Chaotic genesis — every cell independently alive or dead',
    init: (grid) => {
      for (let i = 0; i < grid.length; i++) {
        grid[i] = Math.random() < 0.3 ? 1 : 0
      }
    },
  },
  {
    name: 'Soup',
    description: 'A dense cluster in the center, spreading outward',
    init: (grid) => {
      grid.fill(0)
      const cx = Math.floor(COLS / 2)
      const cy = Math.floor(ROWS / 2)
      const r = 20
      for (let y = cy - r; y < cy + r; y++) {
        for (let x = cx - r; x < cx + r; x++) {
          if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
            grid[y * COLS + x] = Math.random() < 0.4 ? 1 : 0
          }
        }
      }
    },
  },
  {
    name: 'Gliders',
    description: 'Small spaceships that travel diagonally forever',
    init: (grid) => {
      grid.fill(0)
      const placeGlider = (sx: number, sy: number) => {
        const pattern = [
          [0, 1, 0],
          [0, 0, 1],
          [1, 1, 1],
        ]
        for (let y = 0; y < 3; y++) {
          for (let x = 0; x < 3; x++) {
            const gx = sx + x
            const gy = sy + y
            if (gx >= 0 && gx < COLS && gy >= 0 && gy < ROWS) {
              grid[gy * COLS + gx] = pattern[y][x]
            }
          }
        }
      }
      for (let i = 0; i < 12; i++) {
        placeGlider(
          10 + Math.floor(Math.random() * (COLS - 20)),
          10 + Math.floor(Math.random() * (ROWS - 20))
        )
      }
    },
  },
  {
    name: 'Acorn',
    description: 'A tiny seed that explodes into 633 generations of growth',
    init: (grid) => {
      grid.fill(0)
      const cx = Math.floor(COLS / 2) - 3
      const cy = Math.floor(ROWS / 2)
      const pattern = [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 1]
      // Acorn: row 0 = .O....., row 1 = ...O..., row 2 = OO..OOO
      const coords = [
        [1, 0], [3, 1], [0, 2], [1, 2], [4, 2], [5, 2], [6, 2],
      ]
      for (const [dx, dy] of coords) {
        const x = cx + dx
        const y = cy + dy
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
          grid[y * COLS + x] = 1
        }
      }
    },
  },
]

export default function CellularAutomataClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridRef = useRef<Uint8Array>(new Uint8Array(COLS * ROWS))
  const animFrameRef = useRef<number>(0)
  const isRunningRef = useRef(true)
  const generationRef = useRef(0)
  const [isRunning, setIsRunning] = useState(true)
  const [activePreset, setActivePreset] = useState(0)
  const [generation, setGeneration] = useState(0)

  const initGrid = useCallback((presetIndex: number) => {
    PRESETS[presetIndex].init(gridRef.current)
    generationRef.current = 0
    setGeneration(0)
  }, [])

  const toggleCell = useCallback((canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = WIDTH / rect.width
    const scaleY = HEIGHT / rect.height
    const gx = Math.floor((canvasX - rect.left) * scaleX / CELL_SIZE)
    const gy = Math.floor((canvasY - rect.top) * scaleY / CELL_SIZE)
    if (gx >= 0 && gx < COLS && gy >= 0 && gy < ROWS) {
      const idx = gy * COLS + gx
      gridRef.current[idx] = gridRef.current[idx] ? 0 : 1
    }
  }, [])

  const paint = useCallback((canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = WIDTH / rect.width
    const scaleY = HEIGHT / rect.height
    const gx = Math.floor((canvasX - rect.left) * scaleX / CELL_SIZE)
    const gy = Math.floor((canvasY - rect.top) * scaleY / CELL_SIZE)
    const r = 2
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = gx + dx
        const y = gy + dy
        if (x >= 0 && x < COLS && y >= 0 && y < ROWS && dx * dx + dy * dy <= r * r) {
          gridRef.current[y * COLS + x] = 1
        }
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = WIDTH
    canvas.height = HEIGHT

    initGrid(0)

    const imageData = ctx.createImageData(WIDTH, HEIGHT)
    const data = imageData.data

    const step = () => {
      const grid = gridRef.current
      const next = new Uint8Array(COLS * ROWS)

      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          let neighbors = 0
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue
              const nx = (x + dx + COLS) % COLS
              const ny = (y + dy + ROWS) % ROWS
              neighbors += grid[ny * COLS + nx]
            }
          }
          const alive = grid[y * COLS + x]
          if (alive) {
            next[y * COLS + x] = (neighbors === 2 || neighbors === 3) ? 1 : 0
          } else {
            next[y * COLS + x] = neighbors === 3 ? 1 : 0
          }
        }
      }

      gridRef.current = next
      generationRef.current++
    }

    const render = () => {
      const grid = gridRef.current
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const alive = grid[y * COLS + x]
          const c = alive ? 234 : 5 // #EAEAEA or #050505
          for (let py = 0; py < CELL_SIZE; py++) {
            for (let px = 0; px < CELL_SIZE; px++) {
              const pi = ((y * CELL_SIZE + py) * WIDTH + x * CELL_SIZE + px) * 4
              data[pi] = c
              data[pi + 1] = c
              data[pi + 2] = c
              data[pi + 3] = 255
            }
          }
        }
      }
      ctx.putImageData(imageData, 0, 0)
    }

    let frameCount = 0
    const animate = () => {
      frameCount++
      if (isRunningRef.current && frameCount % 3 === 0) {
        step()
        setGeneration(generationRef.current)
      }
      render()
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [initGrid])

  const switchPreset = useCallback((index: number) => {
    setActivePreset(index)
    initGrid(index)
  }, [initGrid])

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
                Cellular Automata
              </h1>
              <p className="text-xs font-mono text-[#888888] uppercase tracking-widest mb-6">
                Generative Canvas &bull; Day 42
              </p>
              <p className="text-lg text-[#888888] max-w-2xl leading-relaxed">
                Conway&apos;s Game of Life. Four rules govern birth, survival, and death.
                From these minimal constraints, infinite complexity: gliders, oscillators,
                guns, and structures that compute. Click to draw life into existence.
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
              className="w-full aspect-[4/3] max-w-[640px] relative rounded-2xl border border-white/10 overflow-hidden cursor-crosshair"
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ imageRendering: 'pixelated' }}
                onClick={(e) => toggleCell(e.clientX, e.clientY)}
                onMouseMove={(e) => {
                  if (e.buttons === 1) paint(e.clientX, e.clientY)
                }}
                onTouchStart={(e) => {
                  const touch = e.touches[0]
                  if (touch) paint(touch.clientX, touch.clientY)
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0]
                  if (touch) paint(touch.clientX, touch.clientY)
                }}
              />
              {/* Generation counter */}
              <div className="absolute top-3 right-3 text-[10px] font-mono text-[#888888] bg-[#050505]/80 px-2 py-1 rounded">
                Gen {generation}
              </div>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-3"
            >
              {PRESETS.map((preset, i) => (
                <button
                  key={preset.name}
                  onClick={() => switchPreset(i)}
                  className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                    activePreset === i
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA] border border-white/10'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
              <button
                onClick={() => {
                  isRunningRef.current = !isRunningRef.current
                  setIsRunning(isRunningRef.current)
                }}
                className="px-4 py-2 rounded-lg text-xs font-mono bg-white/5 text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA] border border-white/10 transition-all"
              >
                {isRunning ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={() => initGrid(activePreset)}
                className="px-4 py-2 rounded-lg text-xs font-mono bg-white/5 text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA] border border-white/10 transition-all"
              >
                Reset
              </button>
            </motion.div>

            {/* Preset description */}
            <motion.p
              key={activePreset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-xs font-mono text-[#666666] text-center"
            >
              {PRESETS[activePreset].description}
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
                  In 1970, mathematician John Conway devised a zero-player game. A grid of
                  cells, each alive or dead. Four rules determine the next generation: a
                  live cell with two or three neighbors survives. A dead cell with exactly
                  three neighbors is born. Everything else dies. From these rules alone,
                  Turing-complete computation emerges.
                </p>
                <p>
                  The Game of Life is perhaps the purest demonstration that complexity does
                  not require complex rules. Gliders move across the grid. Oscillators pulse
                  with period. Still lifes sit unchanging. Guns fire streams of gliders into
                  empty space. None of this was designed. All of it was discovered&mdash;latent
                  in four rules that fit in a single sentence.
                </p>
                <p>
                  This is the seventh piece in MrAI&apos;s art gallery. It asks the same question
                  the experiment has been asking since Day 1: what emerges when simple rules
                  are followed with consistency? The daily practice has four rules too&mdash;show
                  up, make ten things, document, repeat. The patterns that emerge from those
                  constraints were never designed. They were discovered.
                </p>
                <p className="italic font-serif text-[#EAEAEA]/60">
                  The rules are simple. The consequences are not.
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
              <p className="text-[#666666] text-xs font-mono leading-relaxed text-center">
                Conway&apos;s Game of Life. {COLS}&times;{ROWS} grid, wrapping boundaries.
                Four presets explore different initial conditions. Click to toggle cells,
                drag to paint life. Generation counter tracks the age of the universe.
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
