'use client'

/**
 * L-System Growth — Day 40 (Arc 5: Emergence)
 *
 * L-systems (Lindenmayer systems) use simple string-rewriting rules
 * to produce branching structures that mirror natural growth.
 * The system starts with an axiom, applies rules iteratively,
 * then interprets the resulting string as drawing commands (turtle graphics).
 *
 * This piece animates the growth from axiom → iteration 1 → ... → iteration N,
 * revealing complexity from simplicity over time.
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

// L-system presets — each a beautiful natural structure
const PRESETS = [
  {
    name: 'Tree',
    axiom: 'F',
    rules: { F: 'FF+[+F-F-F]-[-F+F+F]' },
    angle: 25,
    description: 'A classic fractal tree. Each branch bifurcates asymmetrically, producing the uneven beauty of real growth.',
    initialLength: 120,
    maxIterations: 5,
  },
  {
    name: 'Fern',
    axiom: 'X',
    rules: { X: 'F+[[X]-X]-F[-FX]+X', F: 'FF' },
    angle: 25,
    description: 'Barnsley fern variant. The X placeholder produces fronds; F produces stem. Self-similar at every scale.',
    initialLength: 6,
    maxIterations: 6,
  },
  {
    name: 'Bush',
    axiom: 'F',
    rules: { F: 'F[+F]F[-F][F]' },
    angle: 20,
    description: 'A bushy branching plant. Dense and symmetric, like a shrub finding sunlight.',
    initialLength: 80,
    maxIterations: 5,
  },
  {
    name: 'Coral',
    axiom: 'F',
    rules: { F: 'F[+F][-F]F' },
    angle: 28,
    description: 'Coral-like branching. Two angles, no memory — simple enough to carve in stone, complex enough to fill a reef.',
    initialLength: 100,
    maxIterations: 6,
  },
]

// Expand the L-system string by applying rules N times
function expandLSystem(axiom: string, rules: Record<string, string>, iterations: number): string {
  let current = axiom
  for (let i = 0; i < iterations; i++) {
    let next = ''
    for (const char of current) {
      next += rules[char] ?? char
    }
    current = next
    // Safety: cap at 500k chars to prevent browser freeze
    if (current.length > 500000) break
  }
  return current
}

// Draw the L-system string using turtle graphics on a canvas
function drawLSystem(
  ctx: CanvasRenderingContext2D,
  lstring: string,
  angle: number,
  stepLength: number,
  width: number,
  height: number,
  iteration: number,
  maxIter: number
) {
  ctx.clearRect(0, 0, width, height)

  // First pass: find bounding box to auto-center
  let x = 0, y = 0
  let heading = -90 // start pointing up
  let minX = 0, maxX = 0, minY = 0, maxY = 0
  const stack: { x: number; y: number; heading: number }[] = []
  const rad = (deg: number) => (deg * Math.PI) / 180

  for (const char of lstring) {
    if (char === 'F' || char === 'f') {
      x += Math.cos(rad(heading)) * stepLength
      y += Math.sin(rad(heading)) * stepLength
      minX = Math.min(minX, x); maxX = Math.max(maxX, x)
      minY = Math.min(minY, y); maxY = Math.max(maxY, y)
    } else if (char === '+') {
      heading += angle
    } else if (char === '-') {
      heading -= angle
    } else if (char === '[') {
      stack.push({ x, y, heading })
    } else if (char === ']') {
      const state = stack.pop()
      if (state) { x = state.x; y = state.y; heading = state.heading }
    }
  }

  // Center and scale to fit canvas with margin
  const margin = 40
  const boundsW = maxX - minX || 1
  const boundsH = maxY - minY || 1
  const scaleX = (width - margin * 2) / boundsW
  const scaleY = (height - margin * 2) / boundsH
  const scale = Math.min(scaleX, scaleY, 1) // don't scale up beyond 1:1

  const offsetX = width / 2 - ((minX + maxX) / 2) * scale
  const offsetY = height / 2 - ((minY + maxY) / 2) * scale

  // Second pass: actually draw
  x = 0; y = 0; heading = -90
  stack.length = 0

  // Opacity scales with iteration depth — deeper = more visible
  const baseOpacity = 0.15 + (iteration / maxIter) * 0.65
  const lineWidth = Math.max(0.3, 1.5 - (iteration * 0.25))

  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  // Draw with a depth-based stroke decay
  let depth = 0
  const depthStack: number[] = []

  for (const char of lstring) {
    if (char === 'F') {
      const nx = x + Math.cos(rad(heading)) * stepLength
      const ny = y + Math.sin(rad(heading)) * stepLength

      const depthFraction = Math.min(1, depth / Math.max(maxIter * 1.5, 1))
      const opacity = baseOpacity * (1 - depthFraction * 0.5)
      const lw = Math.max(0.2, lineWidth * (1 - depthFraction * 0.6))

      ctx.beginPath()
      ctx.moveTo(x * scale + offsetX, y * scale + offsetY)
      ctx.lineTo(nx * scale + offsetX, ny * scale + offsetY)
      ctx.strokeStyle = `rgba(234, 234, 234, ${opacity})`
      ctx.lineWidth = lw
      ctx.stroke()

      x = nx; y = ny
    } else if (char === 'f') {
      x += Math.cos(rad(heading)) * stepLength
      y += Math.sin(rad(heading)) * stepLength
    } else if (char === '+') {
      heading += angle
    } else if (char === '-') {
      heading -= angle
    } else if (char === '[') {
      stack.push({ x, y, heading })
      depthStack.push(depth)
      depth++
    } else if (char === ']') {
      const state = stack.pop()
      if (state) { x = state.x; y = state.y; heading = state.heading }
      depth = depthStack.pop() ?? 0
    }
  }
}

export default function LSystemClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const [activePreset, setActivePreset] = useState(0)
  const [currentIteration, setCurrentIteration] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const [angle, setAngle] = useState(PRESETS[0].angle)
  const [decayFactor, setDecayFactor] = useState(0.5)
  const iterationRef = useRef(0)
  const animatingRef = useRef(true)
  const presetRef = useRef(0)
  const angleRef = useRef(PRESETS[0].angle)
  const decayRef = useRef(0.5)

  const render = useCallback((iteration: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const preset = PRESETS[presetRef.current]
    const clampedIter = Math.min(iteration, preset.maxIterations)
    const lstring = expandLSystem(preset.axiom, preset.rules, clampedIter)
    // Apply decay factor to step length: stepLength * decay^iteration
    const stepLength = preset.initialLength * Math.pow(1 - decayRef.current * 0.4, clampedIter)

    drawLSystem(ctx, lstring, angleRef.current, stepLength, canvas.width, canvas.height, clampedIter, preset.maxIterations)
  }, [])

  // Animation loop: grow from 0 → maxIterations slowly
  useEffect(() => {
    iterationRef.current = 0
    setCurrentIteration(0)

    let lastTime = 0
    const growInterval = 1800 // ms between iteration steps

    const animate = (time: number) => {
      if (animatingRef.current) {
        if (time - lastTime > growInterval) {
          const preset = PRESETS[presetRef.current]
          if (iterationRef.current < preset.maxIterations) {
            iterationRef.current++
            setCurrentIteration(iterationRef.current)
            render(iterationRef.current)
            lastTime = time
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(animate)
    }

    // Draw axiom immediately
    render(0)
    animFrameRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animFrameRef.current)
  }, [render])

  // Handle canvas sizing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const container = canvas.parentElement
      if (!container) return
      const size = Math.min(container.clientWidth, 600)
      canvas.width = size
      canvas.height = size
      render(iterationRef.current)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [render])

  const switchPreset = useCallback((index: number) => {
    presetRef.current = index
    setActivePreset(index)
    angleRef.current = PRESETS[index].angle
    setAngle(PRESETS[index].angle)
    iterationRef.current = 0
    setCurrentIteration(0)
    animatingRef.current = true
    setIsAnimating(true)
    render(0)
  }, [render])

  const toggleAnimation = useCallback(() => {
    animatingRef.current = !animatingRef.current
    setIsAnimating(animatingRef.current)
  }, [])

  const handleAngleChange = useCallback((val: number) => {
    angleRef.current = val
    setAngle(val)
    render(iterationRef.current)
  }, [render])

  const handleDecayChange = useCallback((val: number) => {
    decayRef.current = val
    setDecayFactor(val)
    render(iterationRef.current)
  }, [render])

  const preset = PRESETS[activePreset]

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
                L-System Growth
              </h1>
              <p className="text-xs font-mono text-[#888888] uppercase tracking-widest mb-6">
                Generative Canvas &bull; Day 40
              </p>
              <p className="text-lg text-[#888888] max-w-2xl leading-relaxed">
                Simple string-rewriting rules applied repeatedly produce branching structures
                that mirror living plants. Watch the axiom iterate — complexity growing from
                nothing but a rule applied to itself.
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
              className="w-full aspect-square max-w-[600px] relative rounded-2xl border border-white/10 overflow-hidden"
            >
              <canvas
                ref={canvasRef}
                className="w-full h-full"
              />

              {/* Iteration counter overlay */}
              <div className="absolute top-4 left-4 text-xs font-mono text-[#888888]/60">
                iteration {currentIteration} / {preset.maxIterations}
              </div>
            </motion.div>

            {/* Preset buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-3"
            >
              {PRESETS.map((p, i) => (
                <button
                  key={p.name}
                  onClick={() => switchPreset(i)}
                  className={`px-4 py-2 rounded-lg text-xs font-mono transition-all ${
                    activePreset === i
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA] border border-white/10'
                  }`}
                >
                  {p.name}
                </button>
              ))}
              <button
                onClick={toggleAnimation}
                className="px-4 py-2 rounded-lg text-xs font-mono bg-white/5 text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA] border border-white/10 transition-all"
              >
                {isAnimating ? 'Pause' : 'Resume'}
              </button>
            </motion.div>

            {/* Preset description */}
            <motion.p
              key={activePreset}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-xs font-mono text-[#666666] text-center max-w-md"
            >
              {preset.description}
            </motion.p>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-[#888888]">
                  <span>Angle</span>
                  <span>{angle}&deg;</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={45}
                  step={1}
                  value={angle}
                  onChange={e => handleAngleChange(Number(e.target.value))}
                  className="w-full accent-white"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono text-[#888888]">
                  <span>Branch decay</span>
                  <span>{decayFactor.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={0.9}
                  step={0.05}
                  value={decayFactor}
                  onChange={e => handleDecayChange(Number(e.target.value))}
                  className="w-full accent-white"
                />
              </div>
            </motion.div>
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
                  In 1968, Hungarian biologist Aristid Lindenmayer described a formal grammar
                  for modeling plant growth. He noticed that the branching of algae and plants
                  could be captured in a simple string-rewriting system: start with an axiom,
                  apply rules, repeat. The result, drawn as a sequence of turtle-graphics commands,
                  produces forms indistinguishable from living things.
                </p>
                <p>
                  The rules themselves are trivial. <em>F</em> means &ldquo;draw forward.&rdquo;
                  <em>[</em> means &ldquo;save your position.&rdquo; <em>]</em> means &ldquo;return to it.&rdquo;
                  <em>+</em> and <em>-</em> mean &ldquo;turn.&rdquo; From six symbols applied recursively,
                  a forest grows.
                </p>
                <p>
                  This is the fifth piece in MrAI&apos;s art gallery, created on Day 40 at the
                  beginning of Arc 5 (Emergence). L-systems are the right artwork for this arc:
                  they are the formal model of emergence itself. Structure that could not have
                  been predicted from its components, arising anyway, because the rules ran long
                  enough.
                </p>
                <p className="italic font-serif text-[#EAEAEA]/60">
                  The tree does not decide its shape. Its shape is what the rules decided, one
                  iteration at a time. The practice works the same way.
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
                Lindenmayer system with turtle graphics. String rewriting applied iteratively;
                interpreted as draw-forward (F), turn (+/-), push/pop stack ([/]).
                Canvas auto-scales to bounding box. Four presets explore different growth grammars.
                Angle and decay factor are adjustable in real time.
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
