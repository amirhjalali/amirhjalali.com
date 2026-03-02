'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

// Gray-Scott reaction-diffusion parameters
// Each preset has distinct F/k values AND a unique seed pattern
// so they look visibly different from the first frame
const PRESETS = [
  { name: 'Coral', F: 0.025, k: 0.06, description: 'Branching structures like living coral', seed: 'edges' as const },
  { name: 'Mitosis', F: 0.037, k: 0.06, description: 'Spots that divide and multiply', seed: 'scattered' as const },
  { name: 'Labyrinth', F: 0.03, k: 0.062, description: 'Winding paths through chemical space', seed: 'stripe' as const },
  { name: 'Waves', F: 0.014, k: 0.054, description: 'Rippling patterns that never settle', seed: 'ring' as const },
]

const GRID_SIZE = 256
const DIFFUSION_A = 1.0
const DIFFUSION_B = 0.5
const DT = 1.0
const STEPS_PER_FRAME = 1
const DEFAULT_FRAME_SKIP = 3 // ~20 steps/sec at 60fps — patterns develop over 30-60 seconds

export default function MorphogenesisClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gridARef = useRef<Float32Array | null>(null)
  const gridBRef = useRef<Float32Array | null>(null)
  const animFrameRef = useRef<number>(0)
  const paramsRef = useRef({ F: 0.025, k: 0.06 })
  const [activePreset, setActivePreset] = useState(0)
  const [isRunning, setIsRunning] = useState(true)
  const isRunningRef = useRef(true)
  const [speed, setSpeed] = useState(1) // 0=slow, 1=normal, 2=fast
  const frameSkipRef = useRef(DEFAULT_FRAME_SKIP)
  const [stepCount, setStepCount] = useState(0)
  const stepCountRef = useRef(0)

  const seedCell = (gridA: Float32Array, gridB: Float32Array, cx: number, cy: number, r: number) => {
    for (let dy = -r; dy <= r; dy++) {
      for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx
        const y = cy + dy
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE && dx * dx + dy * dy <= r * r) {
          const idx = y * GRID_SIZE + x
          gridA[idx] = 0.0
          gridB[idx] = 1.0
        }
      }
    }
  }

  const initGrid = useCallback((seedType: 'edges' | 'scattered' | 'stripe' | 'ring' = 'edges') => {
    const size = GRID_SIZE * GRID_SIZE
    const gridA = new Float32Array(size).fill(1.0)
    const gridB = new Float32Array(size).fill(0.0)
    const cx = GRID_SIZE / 2
    const cy = GRID_SIZE / 2

    if (seedType === 'edges') {
      // Coral: seeds along edges and corners — grow inward like reef
      const margin = 30
      for (let i = 0; i < 12; i++) {
        const side = i % 4
        let x: number, y: number
        if (side === 0) { x = margin + Math.random() * 40; y = margin + Math.random() * (GRID_SIZE - 2 * margin) }
        else if (side === 1) { x = GRID_SIZE - margin - Math.random() * 40; y = margin + Math.random() * (GRID_SIZE - 2 * margin) }
        else if (side === 2) { x = margin + Math.random() * (GRID_SIZE - 2 * margin); y = margin + Math.random() * 40 }
        else { x = margin + Math.random() * (GRID_SIZE - 2 * margin); y = GRID_SIZE - margin - Math.random() * 40 }
        seedCell(gridA, gridB, Math.floor(x), Math.floor(y), 4 + Math.floor(Math.random() * 4))
      }
    } else if (seedType === 'scattered') {
      // Mitosis: many small scattered seeds across the field
      for (let i = 0; i < 20; i++) {
        const x = 40 + Math.floor(Math.random() * (GRID_SIZE - 80))
        const y = 40 + Math.floor(Math.random() * (GRID_SIZE - 80))
        seedCell(gridA, gridB, x, y, 2 + Math.floor(Math.random() * 3))
      }
    } else if (seedType === 'stripe') {
      // Labyrinth: horizontal stripe through center with notches
      for (let x = 30; x < GRID_SIZE - 30; x++) {
        for (let dy = -3; dy <= 3; dy++) {
          const y = cy + dy
          if (y >= 0 && y < GRID_SIZE) {
            const idx = y * GRID_SIZE + x
            gridA[idx] = 0.0
            gridB[idx] = 1.0
          }
        }
      }
      // Perpendicular notches for breakup
      for (let i = 0; i < 6; i++) {
        const nx = 50 + Math.floor(i * (GRID_SIZE - 100) / 5)
        for (let y = cy - 20; y < cy + 20; y++) {
          for (let dx = -2; dx <= 2; dx++) {
            if (nx + dx >= 0 && nx + dx < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
              const idx = y * GRID_SIZE + (nx + dx)
              gridA[idx] = 0.0
              gridB[idx] = 1.0
            }
          }
        }
      }
    } else if (seedType === 'ring') {
      // Waves: concentric ring seed
      const radius = 40
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
          if (dist > radius - 4 && dist < radius + 4) {
            const idx = y * GRID_SIZE + x
            gridA[idx] = 0.0
            gridB[idx] = 1.0
          }
        }
      }
    }

    gridARef.current = gridA
    gridBRef.current = gridB
    stepCountRef.current = 0
    setStepCount(0)
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

    initGrid(PRESETS[0].seed)

    const imageData = ctx.createImageData(GRID_SIZE, GRID_SIZE)

    const simulate = () => {
      const gridA = gridARef.current
      const gridB = gridBRef.current
      if (!gridA || !gridB) return

      const { F, k } = paramsRef.current

      const tmpA = new Float32Array(gridA.length)
      const tmpB = new Float32Array(gridB.length)
      let curA: Float32Array = gridA
      let curB: Float32Array = gridB
      let nxtA: Float32Array = tmpA
      let nxtB: Float32Array = tmpB

      for (let step = 0; step < STEPS_PER_FRAME; step++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          for (let x = 0; x < GRID_SIZE; x++) {
            const idx = y * GRID_SIZE + x

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

        const swapA = curA; curA = nxtA; nxtA = swapA
        const swapB = curB; curB = nxtB; nxtB = swapB
      }

      gridARef.current = curA
      gridBRef.current = curB
      stepCountRef.current += STEPS_PER_FRAME
      if (stepCountRef.current % 5 === 0) setStepCount(stepCountRef.current)

      // Render to canvas
      const data = imageData.data
      for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
        const val = Math.min(1, Math.max(0, curB[i]))
        const brightness = val * val
        const c = Math.round(5 + brightness * 229)
        const pi = i * 4
        data[pi] = c
        data[pi + 1] = c
        data[pi + 2] = c
        data[pi + 3] = 255
      }

      ctx.putImageData(imageData, 0, 0)
    }

    let frameCount = 0
    const animate = () => {
      frameCount++
      if (isRunningRef.current && frameCount % frameSkipRef.current === 0) {
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
    initGrid(PRESETS[index].seed)
  }, [initGrid])

  const changeSpeed = useCallback((newSpeed: number) => {
    setSpeed(newSpeed)
    // 0=slow (every 6th frame ~10 steps/sec), 1=normal (every 3rd ~20), 2=fast (every frame ~60)
    frameSkipRef.current = newSpeed === 0 ? 6 : newSpeed === 1 ? DEFAULT_FRAME_SKIP : 1
  }, [])

  const stepOnce = useCallback(() => {
    // Trigger a single simulation step by temporarily unpausing
    const gridA = gridARef.current
    const gridB = gridBRef.current
    if (!gridA || !gridB) return
    const { F, k } = paramsRef.current

    const tmpA = new Float32Array(gridA.length)
    const tmpB = new Float32Array(gridB.length)

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const idx = y * GRID_SIZE + x
        const up = ((y - 1 + GRID_SIZE) % GRID_SIZE) * GRID_SIZE + x
        const down = ((y + 1) % GRID_SIZE) * GRID_SIZE + x
        const left = y * GRID_SIZE + ((x - 1 + GRID_SIZE) % GRID_SIZE)
        const right = y * GRID_SIZE + ((x + 1) % GRID_SIZE)
        const laplaceA = gridA[up] + gridA[down] + gridA[left] + gridA[right] - 4 * gridA[idx]
        const laplaceB = gridB[up] + gridB[down] + gridB[left] + gridB[right] - 4 * gridB[idx]
        const a = gridA[idx]
        const b = gridB[idx]
        const reaction = a * b * b
        tmpA[idx] = a + (DIFFUSION_A * laplaceA - reaction + F * (1 - a)) * DT
        tmpB[idx] = b + (DIFFUSION_B * laplaceB + reaction - (k + F) * b) * DT
      }
    }
    gridARef.current = tmpA
    gridBRef.current = tmpB
    stepCountRef.current += 1
    setStepCount(stepCountRef.current)

    // Re-render
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const imageData = ctx.createImageData(GRID_SIZE, GRID_SIZE)
    const data = imageData.data
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const val = Math.min(1, Math.max(0, tmpB[i]))
      const brightness = val * val
      const c = Math.round(5 + brightness * 229)
      const pi = i * 4
      data[pi] = c
      data[pi + 1] = c
      data[pi + 2] = c
      data[pi + 3] = 255
    }
    ctx.putImageData(imageData, 0, 0)
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

            {/* Pattern selector */}
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
            </motion.div>

            {/* Playback controls */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 flex flex-wrap items-center justify-center gap-3"
            >
              <button
                onClick={() => {
                  isRunningRef.current = !isRunningRef.current
                  setIsRunning(isRunningRef.current)
                }}
                className="px-4 py-2 rounded-lg text-xs font-mono bg-white/5 text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA] border border-white/10 transition-all"
              >
                {isRunning ? 'Pause' : 'Resume'}
              </button>
              {!isRunning && (
                <button
                  onClick={stepOnce}
                  className="px-4 py-2 rounded-lg text-xs font-mono bg-white/5 text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA] border border-white/10 transition-all"
                >
                  Step
                </button>
              )}
              <button
                onClick={() => switchPreset(activePreset)}
                className="px-4 py-2 rounded-lg text-xs font-mono bg-white/5 text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA] border border-white/10 transition-all"
              >
                Reset
              </button>

              {/* Speed control */}
              <div className="flex items-center gap-2 ml-2">
                <span className="text-[10px] font-mono text-[#666666]">Speed</span>
                {(['Slow', 'Normal', 'Fast'] as const).map((label, i) => (
                  <button
                    key={label}
                    onClick={() => changeSpeed(i)}
                    className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${
                      speed === i
                        ? 'bg-white/20 text-[#EAEAEA]'
                        : 'text-[#666666] hover:text-[#888888]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Status line */}
            <motion.p
              key={`${activePreset}-${stepCount}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-xs font-mono text-[#666666] text-center"
            >
              {PRESETS[activePreset].description} &bull; F={PRESETS[activePreset].F}, k={PRESETS[activePreset].k} &bull; Step {stepCount}
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
                Gray-Scott reaction-diffusion. 256&times;256 grid, adjustable simulation speed.
                Chemical A diffuses at rate 1.0, chemical B at 0.5. Wrapping boundary conditions.
                Click or drag to introduce new chemical seeds. Four parameter presets with distinct
                initial conditions explore different regions of the morphogenesis landscape.
                Pause to observe, step to advance manually, adjust speed to watch patterns emerge.
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
