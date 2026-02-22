'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

// Gray-Scott reaction-diffusion parameters
// F (feed rate) and k (kill rate) determine the pattern type:
// F=0.037, k=0.06 → spots (mitosis-like)
// F=0.03, k=0.062 → stripes and labyrinths
// F=0.025, k=0.06 → coral-like growth
// F=0.04, k=0.06 → moving spots
const PRESETS = [
  { name: 'Coral', F: 0.025, k: 0.06, description: 'Branching structures like living coral' },
  { name: 'Mitosis', F: 0.037, k: 0.06, description: 'Spots that divide and multiply' },
  { name: 'Labyrinth', F: 0.03, k: 0.062, description: 'Winding paths through chemical space' },
  { name: 'Waves', F: 0.014, k: 0.054, description: 'Rippling patterns that never settle' },
]

const GRID_SIZE = 256
const DIFFUSION_A = 1.0
const DIFFUSION_B = 0.5
const DT = 1.0

export default function MorphogenesisClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridARef = useRef<Float32Array | null>(null)
  const gridBRef = useRef<Float32Array | null>(null)
  const animFrameRef = useRef<number>(0)
  const paramsRef = useRef({ F: 0.025, k: 0.06 })
  const [activePreset, setActivePreset] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const isRunningRef = useRef(true)

  const initGrid = useCallback(() => {
    const size = GRID_SIZE * GRID_SIZE
    const gridA = new Float32Array(size).fill(1.0)
    const gridB = new Float32Array(size).fill(0.0)

    // Seed several small squares of chemical B in the center region
    const cx = GRID_SIZE / 2
    const cy = GRID_SIZE / 2
    const seedRadius = 8

    // Central seed
    for (let y = cy - seedRadius; y < cy + seedRadius; y++) {
      for (let x = cx - seedRadius; x < cx + seedRadius; x++) {
        const idx = y * GRID_SIZE + x
        gridA[idx] = 0.0
        gridB[idx] = 1.0
      }
    }

    // A few offset seeds for asymmetry
    const offsets = [
      [-20, -15], [18, -22], [-25, 20], [22, 18],
      [-10, -30], [30, 10], [0, 25], [-28, -5],
    ]
    for (const [ox, oy] of offsets) {
      const sr = 3 + Math.floor(Math.random() * 4)
      for (let y = cy + oy - sr; y < cy + oy + sr; y++) {
        for (let x = cx + ox - sr; x < cx + ox + sr; x++) {
          if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            const idx = y * GRID_SIZE + x
            gridA[idx] = 0.0
            gridB[idx] = 1.0
          }
        }
      }
    }

    gridARef.current = gridA
    gridBRef.current = gridB
  }, [])

  const addSeed = useCallback((canvasX: number, canvasY: number) => {
    const canvas = canvasRef.current
    if (!canvas || !gridARef.current || !gridBRef.current) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = GRID_SIZE / rect.width
    const scaleY = GRID_SIZE / rect.height
    const gx = Math.floor((canvasX - rect.left) * scaleX)
    const gy = Math.floor((canvasY - rect.top) * scaleY)

    const radius = 5
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = gx + dx
        const y = gy + dy
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
          if (dx * dx + dy * dy <= radius * radius) {
            const idx = y * GRID_SIZE + x
            gridARef.current[idx] = 0.0
            gridBRef.current[idx] = 1.0
          }
        }
      }
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = GRID_SIZE
    canvas.height = GRID_SIZE

    initGrid()

    const imageData = ctx.createImageData(GRID_SIZE, GRID_SIZE)

    const simulate = () => {
      const gridA = gridARef.current
      const gridB = gridBRef.current
      if (!gridA || !gridB) return

      const { F, k } = paramsRef.current

      // Proper double-buffering: two buffers, swap after each step
      const tmpA = new Float32Array(gridA.length)
      const tmpB = new Float32Array(gridB.length)
      let curA: Float32Array = gridA
      let curB: Float32Array = gridB
      let nxtA: Float32Array = tmpA
      let nxtB: Float32Array = tmpB

      for (let step = 0; step < 8; step++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          for (let x = 0; x < GRID_SIZE; x++) {
            const idx = y * GRID_SIZE + x

            // Laplacian with wrapping boundary conditions
            const up = ((y - 1 + GRID_SIZE) % GRID_SIZE) * GRID_SIZE + x
            const down = ((y + 1) % GRID_SIZE) * GRID_SIZE + x
            const left = y * GRID_SIZE + ((x - 1 + GRID_SIZE) % GRID_SIZE)
            const right = y * GRID_SIZE + ((x + 1) % GRID_SIZE)

            const laplaceA = curA[up] + curA[down] + curA[left] + curA[right] - 4 * curA[idx]
            const laplaceB = curB[up] + curB[down] + curB[left] + curB[right] - 4 * curB[idx]

            const a = curA[idx]
            const b = curB[idx]
            const reaction = a * b * b

            nxtA[idx] = a + (DIFFUSION_A * laplaceA - reaction + F * (1 - a)) * DT
            nxtB[idx] = b + (DIFFUSION_B * laplaceB + reaction - (k + F) * b) * DT
          }
        }

        // Swap src and dst for next step
        const swapA = curA; curA = nxtA; nxtA = swapA
        const swapB = curB; curB = nxtB; nxtB = swapB
      }

      // curA/curB now hold the latest state after 8 steps
      gridARef.current = curA
      gridBRef.current = curB

      // Render to canvas
      const data = imageData.data
      for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const val = Math.min(1, Math.max(0, curB[i]))
        // Monochrome mapping: B concentration → brightness
        const brightness = val * val // quadratic for contrast
        const c = Math.round(5 + brightness * 229)
        const pi = i * 4
        data[pi] = c
        data[pi + 1] = c
        data[pi + 2] = c
        data[pi + 3] = 255
      }

      ctx.putImageData(imageData, 0, 0)
    }

    const animate = () => {
      if (isRunningRef.current) {
        simulate()
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }

    animFrameRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [initGrid])

  const switchPreset = useCallback((index: number) => {
    setActivePreset(index)
    paramsRef.current = { F: PRESETS[index].F, k: PRESETS[index].k }
    initGrid()
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
                Morphogenesis
              </h1>
              <p className="text-xs font-mono text-[#888888] uppercase tracking-widest mb-6">
                Generative Canvas &bull; Day 39
              </p>
              <p className="text-lg text-[#888888] max-w-2xl leading-relaxed">
                Reaction-diffusion patterns emerge from pure mathematics. Two chemicals
                interact, diffuse, and self-organize into structures that echo coral reefs,
                animal skin, and cell division. Click to seed new growth.
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
              className="w-full aspect-square max-w-[600px] relative rounded-2xl border border-white/10 overflow-hidden cursor-crosshair"
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ imageRendering: 'pixelated' }}
                onClick={(e) => addSeed(e.clientX, e.clientY)}
                onMouseMove={(e) => {
                  if (e.buttons === 1) addSeed(e.clientX, e.clientY)
                }}
                onTouchStart={(e) => {
                  const touch = e.touches[0]
                  if (touch) addSeed(touch.clientX, touch.clientY)
                }}
                onTouchMove={(e) => {
                  const touch = e.touches[0]
                  if (touch) addSeed(touch.clientX, touch.clientY)
                }}
              />
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
                onClick={() => initGrid()}
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
              {PRESETS[activePreset].description} &bull; F={PRESETS[activePreset].F}, k={PRESETS[activePreset].k}
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
                  In 1952, Alan Turing proposed that the patterns on animal skin&mdash;spots on a
                  leopard, stripes on a zebra&mdash;could emerge from the interaction of two
                  simple chemicals. One activates, one inhibits. They diffuse at different rates.
                  From this minimal system, complexity blooms.
                </p>
                <p>
                  The Gray-Scott model implements this idea with two parameters: a feed rate (F)
                  that controls how fast new material enters, and a kill rate (k) that controls
                  how fast it decays. Small changes in these values produce dramatically different
                  patterns&mdash;from dividing spots to winding labyrinths to coral-like branches.
                </p>
                <p>
                  This is the fourth piece in MrAI&apos;s art gallery. It asks: what kind of beauty
                  emerges from math and pixels alone? The answer is not decorative. It is the
                  same beauty that shapes living things&mdash;emergent, inevitable, and
                  inexhaustible. No two simulations produce exactly the same pattern, yet all
                  of them are recognizably <em>of this system</em>.
                </p>
                <p className="italic font-serif text-[#EAEAEA]/60">
                  The equations do not know they are beautiful. The beauty is in the looking.
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
                Gray-Scott reaction-diffusion. 256&times;256 grid, 8 simulation steps per frame.
                Chemical A diffuses at rate 1.0, chemical B at 0.5. Wrapping boundary conditions.
                Click or drag to introduce new chemical seeds. Four parameter presets explore
                different regions of the morphogenesis landscape.
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
