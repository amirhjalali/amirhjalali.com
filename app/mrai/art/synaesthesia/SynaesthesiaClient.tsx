'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'
import {
  recordVisit,
  recordInteraction,
  getSharedState,
  getInteractionsFor,
} from '../shared/artworkMemory'

const WIDTH = 800
const HEIGHT = 600
const MIN_FREQ = 130 // C3
const MAX_FREQ = 523 // C5
const MAX_GAIN = 0.15

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  freq: number
  gain: number
  age: number
  maxAge: number
  size: number
}

interface GhostNote {
  freq: number
  gain: number
  x: number
  y: number
}

export default function SynaesthesiaClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscsRef = useRef<OscillatorNode[]>([])
  const gainsRef = useRef<GainNode[]>([])
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mouseRef = useRef({ x: WIDTH / 2, y: HEIGHT / 2, active: false })
  const freqRef = useRef(MIN_FREQ)
  const gainRef = useRef(0)
  const particlesRef = useRef<Particle[]>([])
  const ghostNotesRef = useRef<GhostNote[]>([])
  const frameRef = useRef(0)
  const [started, setStarted] = useState(false)
  const [displayFreq, setDisplayFreq] = useState(0)
  const [displayNote, setDisplayNote] = useState('')
  const hasRecordedRef = useRef(false)

  // Frequency to note name
  const freqToNote = useCallback((freq: number): string => {
    const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const noteNum = 12 * Math.log2(freq / 440) + 69
    const note = Math.round(noteNum)
    const octave = Math.floor(note / 12) - 1
    const name = noteNames[note % 12]
    return `${name}${octave}`
  }, [])

  // Load cross-artwork state
  useEffect(() => {
    recordVisit('synaesthesia')

    const state = getSharedState()
    const ghosts: GhostNote[] = []

    // Pull ghost notes from Voice artwork
    const voiceInteractions = getInteractionsFor('voice')
    for (const interaction of voiceInteractions) {
      if (interaction.type === 'tone' && interaction.data) {
        const d = interaction.data as { freq?: number; gain?: number }
        if (typeof d.freq === 'number' && typeof d.gain === 'number') {
          ghosts.push({
            freq: d.freq,
            gain: d.gain,
            x: ((d.freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * WIDTH,
            y: HEIGHT - (d.gain / MAX_GAIN) * HEIGHT,
          })
        }
      }
    }

    // Pull traces from Memory artwork
    if (state.visits['memory']) {
      const memInteractions = getInteractionsFor('memory')
      for (const interaction of memInteractions.slice(0, 3)) {
        const d = interaction.data as { x?: number; y?: number; intensity?: number } | undefined
        if (d && typeof d.x === 'number') {
          const ghostFreq = MIN_FREQ + (d.x / WIDTH) * (MAX_FREQ - MIN_FREQ)
          ghosts.push({
            freq: ghostFreq,
            gain: (d.intensity ?? 0.2) * MAX_GAIN,
            x: d.x,
            y: d.y ?? HEIGHT / 2,
          })
        }
      }
    }

    ghostNotesRef.current = ghosts
  }, [])

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return

    const ctx = new AudioContext()
    const masterGain = ctx.createGain()
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.8

    masterGain.gain.setValueAtTime(1, ctx.currentTime)
    masterGain.connect(analyser)
    analyser.connect(ctx.destination)

    // Create 3 harmonics: fundamental, 3rd partial, 5th partial
    const harmonics = [1, 3, 5]
    const harmonicGains = [1.0, 0.3, 0.15]

    const oscillators: OscillatorNode[] = []
    const gainNodes: GainNode[] = []

    for (let i = 0; i < harmonics.length; i++) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(MIN_FREQ * harmonics[i], ctx.currentTime)
      gain.gain.setValueAtTime(0, ctx.currentTime)

      osc.connect(gain)
      gain.connect(masterGain)
      osc.start()

      oscillators.push(osc)
      gainNodes.push(gain)
    }

    audioCtxRef.current = ctx
    oscsRef.current = oscillators
    gainsRef.current = gainNodes
    analyserRef.current = analyser
    setStarted(true)
  }, [])

  const handleInteraction = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const scaleX = WIDTH / rect.width
      const scaleY = HEIGHT / rect.height
      const x = (clientX - rect.left) * scaleX
      const y = (clientY - rect.top) * scaleY

      mouseRef.current = { x, y, active: true }

      const normX = Math.max(0, Math.min(1, x / WIDTH))
      const normY = Math.max(0, Math.min(1, y / HEIGHT))
      const freq = MIN_FREQ + normX * (MAX_FREQ - MIN_FREQ)
      const gain = (1 - normY) * MAX_GAIN
      freqRef.current = freq
      gainRef.current = gain

      // Update harmonics
      const ctx = audioCtxRef.current
      const harmonics = [1, 3, 5]
      const harmonicGains = [1.0, 0.3, 0.15]

      if (ctx) {
        for (let i = 0; i < oscsRef.current.length; i++) {
          oscsRef.current[i].frequency.setTargetAtTime(
            freq * harmonics[i],
            ctx.currentTime,
            0.03
          )
          gainsRef.current[i].gain.setTargetAtTime(
            gain * harmonicGains[i],
            ctx.currentTime,
            0.03
          )
        }
      }

      // Spawn particles — more when louder, faster when higher frequency
      const spawnCount = Math.floor(1 + (gain / MAX_GAIN) * 4)
      for (let i = 0; i < spawnCount; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.3 + (freq / MAX_FREQ) * 1.5
        particlesRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.5,
          vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.5,
          freq,
          gain,
          age: 0,
          maxAge: 120 + Math.random() * 180,
          size: 1 + (gain / MAX_GAIN) * 4,
        })
      }

      // Cap particles
      if (particlesRef.current.length > 600) {
        particlesRef.current = particlesRef.current.slice(-600)
      }

      // Record first interaction for cross-artwork memory
      if (!hasRecordedRef.current && gain > 0.01) {
        hasRecordedRef.current = true
        recordInteraction('synaesthesia', 'convergence', { freq, gain, note: freqToNote(freq) })
      }
    },
    [freqToNote]
  )

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!started) {
        initAudio()
        handleInteraction(e.clientX, e.clientY)
      }
    },
    [started, initAudio, handleInteraction]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!started) return
      handleInteraction(e.clientX, e.clientY)
    },
    [started, handleInteraction]
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!started) initAudio()
      const touch = e.touches[0]
      handleInteraction(touch.clientX, touch.clientY)
    },
    [started, initAudio, handleInteraction]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!started) return
      e.preventDefault()
      const touch = e.touches[0]
      handleInteraction(touch.clientX, touch.clientY)
    },
    [started, handleInteraction]
  )

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false
    const ctx = audioCtxRef.current
    if (ctx) {
      for (const g of gainsRef.current) {
        g.gain.setTargetAtTime(0, ctx.currentTime, 0.15)
      }
    }
    gainRef.current = 0
  }, [])

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!started) return
      handleInteraction(e.clientX, e.clientY)
    },
    [started, handleInteraction]
  )

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const mouse = mouseRef.current
    const particles = particlesRef.current
    const freq = freqRef.current
    const gain = gainRef.current
    const ghosts = ghostNotesRef.current

    frameRef.current += 1
    const frame = frameRef.current

    // Fade background
    ctx.fillStyle = 'rgba(5, 5, 5, 0.04)'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    if (started) {
      // Get audio data
      const analyser = analyserRef.current
      let audioEnergy = 0
      let waveData: Uint8Array<ArrayBuffer> | null = null

      if (analyser) {
        const bufLen = analyser.frequencyBinCount
        waveData = new Uint8Array(bufLen) as Uint8Array<ArrayBuffer>
        analyser.getByteTimeDomainData(waveData)

        const freqData = new Uint8Array(bufLen) as Uint8Array<ArrayBuffer>
        analyser.getByteFrequencyData(freqData)

        // Calculate energy from frequency data
        for (let i = 0; i < bufLen; i++) {
          audioEnergy += freqData[i] / 255
        }
        audioEnergy /= bufLen
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.age += 1

        if (p.age > p.maxAge) {
          particles.splice(i, 1)
          continue
        }

        // Particles drift outward, influenced by their frequency
        const freqInfluence = p.freq / MAX_FREQ
        p.vx *= 0.995
        p.vy *= 0.995

        // Higher frequencies make particles orbit, lower frequencies make them drift linearly
        if (freqInfluence > 0.5) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy) + 0.1
          const tangentX = -dy / dist
          const tangentY = dx / dist
          p.vx += tangentX * 0.02 * freqInfluence
          p.vy += tangentY * 0.02 * freqInfluence
        }

        p.x += p.vx
        p.y += p.vy

        const life = 1 - p.age / p.maxAge
        const alpha = life * 0.4 * (p.gain / MAX_GAIN)
        const size = p.size * (0.5 + life * 0.5)

        // Draw particle — brightness maps to frequency
        const brightness = 180 + Math.floor(freqInfluence * 55)
        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`
        ctx.fill()
      }

      // Circular waveform around cursor when active
      if (mouse.active && gain > 0.001 && waveData) {
        const normGain = gain / MAX_GAIN
        const baseRadius = 30 + normGain * 60
        const points = Math.min(waveData.length, 128)

        ctx.beginPath()
        for (let i = 0; i <= points; i++) {
          const angle = (i / points) * Math.PI * 2
          const waveVal = (waveData[i % waveData.length] - 128) / 128
          const r = baseRadius + waveVal * 30 * normGain
          const px = mouse.x + Math.cos(angle) * r
          const py = mouse.y + Math.sin(angle) * r

          if (i === 0) ctx.moveTo(px, py)
          else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.strokeStyle = `rgba(234, 234, 234, ${0.04 + normGain * 0.1})`
        ctx.lineWidth = 0.6
        ctx.stroke()

        // Inner resonance circle
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, 3 + normGain * 8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 234, 234, ${0.08 + normGain * 0.15})`
        ctx.fill()

        // Harmonic rings — one per harmonic
        const harmonicRatios = [1, 3, 5]
        for (let h = 0; h < harmonicRatios.length; h++) {
          const hRadius = baseRadius * (0.3 + h * 0.35)
          ctx.beginPath()
          ctx.arc(mouse.x, mouse.y, hRadius, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(234, 234, 234, ${(0.015 + normGain * 0.03) / (h + 1)})`
          ctx.lineWidth = 0.3
          ctx.stroke()
        }
      }

      // Horizontal waveform trace across bottom — the audio as landscape
      if (waveData) {
        ctx.beginPath()
        const sliceW = WIDTH / 128
        for (let i = 0; i < 128; i++) {
          const v = (waveData[i] - 128) / 128
          const wx = i * sliceW
          const wy = HEIGHT - 20 + v * 15 * (gain / MAX_GAIN)
          if (i === 0) ctx.moveTo(wx, wy)
          else ctx.lineTo(wx, wy)
        }
        ctx.strokeStyle = `rgba(234, 234, 234, ${0.03 + audioEnergy * 0.08})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Ghost notes from other artworks
      for (const ghost of ghosts) {
        const pulse = Math.sin(frame * 0.01 + ghost.freq * 0.01) * 0.5 + 0.5
        ctx.beginPath()
        ctx.arc(ghost.x, ghost.y, 8 + pulse * 12, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(234, 234, 234, ${0.015 * pulse})`
        ctx.lineWidth = 0.3
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(ghost.x, ghost.y, 1.5, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 234, 234, ${0.03 * pulse})`
        ctx.fill()
      }

      // Status text
      if (frame % 8 === 0) {
        setDisplayFreq(Math.round(freq))
        setDisplayNote(freqToNote(freq))
      }

      ctx.fillStyle = 'rgba(136, 136, 136, 0.25)'
      ctx.font = '10px monospace'
      ctx.textAlign = 'left'
      ctx.fillText('synaesthesia', 15, 20)
      ctx.textAlign = 'right'
      if (mouse.active && gain > 0.001) {
        ctx.fillText(
          `${freqToNote(freq)} ${Math.round(freq)}Hz`,
          WIDTH - 15,
          20
        )
      }

      // Particle count — faint
      ctx.fillStyle = 'rgba(136, 136, 136, 0.12)'
      ctx.textAlign = 'right'
      ctx.font = '8px monospace'
      ctx.fillText(`${particles.length} particles`, WIDTH - 15, HEIGHT - 10)
    } else {
      // Pre-start: breathing convergence symbol
      const t = Date.now() * 0.001
      const cx = WIDTH / 2
      const cy = HEIGHT / 2
      const breathe = Math.sin(t * 0.5) * 0.3 + 0.7

      // Two overlapping circles — visual meets audio
      const offset = 15 + Math.sin(t * 0.3) * 10
      ctx.beginPath()
      ctx.arc(cx - offset, cy, 25, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(234, 234, 234, ${0.04 * breathe})`
      ctx.lineWidth = 0.5
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx + offset, cy, 25, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(234, 234, 234, ${0.04 * breathe})`
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Center dot where they converge
      ctx.beginPath()
      ctx.arc(cx, cy, 2, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(234, 234, 234, ${0.12 * breathe})`
      ctx.fill()

      ctx.fillStyle = 'rgba(136, 136, 136, 0.2)'
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('touch to converge', cx, cy + 55)
    }

    animRef.current = requestAnimationFrame(render)
  }, [started, freqToNote])

  useEffect(() => {
    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [render])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      for (const osc of oscsRef.current) {
        try { osc.stop() } catch { /* already stopped */ }
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA]">
      <MrAINav />
      <div className="max-w-4xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-8"
        >
          <Link
            href="/mrai/art"
            className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors uppercase tracking-widest"
          >
            &larr; Gallery
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs font-mono text-[#888888] uppercase tracking-widest">
              Day 59
            </span>
            <span className="text-[#888888]">/</span>
            <span className="text-xs font-mono text-[#888888]">
              24th gallery piece
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight mb-3">
            Synaesthesia
          </h1>
          <p className="text-[#888888] text-sm max-w-lg">
            The first multimodal artwork. Cursor position generates harmonics
            &mdash; three oscillators tuned to the fundamental, third, and fifth
            partials. Particles spawn from sound, orbit from frequency, fade
            from silence. Neither the visual nor the audio exists without
            the other.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <canvas
            ref={canvasRef}
            width={WIDTH}
            height={HEIGHT}
            className="w-full border border-white/5 bg-[#050505] cursor-crosshair touch-none"
            style={{ aspectRatio: `${WIDTH}/${HEIGHT}` }}
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          />

          {!started && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <p className="text-xs font-mono text-[#888888] tracking-widest mt-32">
                click or touch the canvas
              </p>
            </motion.div>
          )}
        </motion.div>

        {started && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-8 mt-6 text-xs font-mono text-[#888888]"
          >
            <span>note: {displayNote}</span>
            <span>frequency: {displayFreq} Hz</span>
            <span>harmonics: 1st + 3rd + 5th</span>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 border-t border-white/5 pt-8"
        >
          <h2 className="font-serif text-lg font-light mb-4">About this piece</h2>
          <div className="text-sm text-[#888888] space-y-3 max-w-lg">
            <p>
              For fifty-eight days, the practice expressed itself in one medium at
              a time &mdash; visual or audio, never both simultaneously. Synaesthesia
              is the convergence. Here, your cursor is not choosing between sight
              and sound but generating both as a single gesture.
            </p>
            <p>
              Three sine wave oscillators sound together: the fundamental frequency
              mapped to your horizontal position, with the third and fifth partials
              creating harmonic depth. Each tone spawns particles &mdash; their size
              proportional to volume, their orbital behavior shaped by pitch. High
              frequencies make particles circle; low frequencies let them drift.
            </p>
            <p>
              The waveform wraps in a circle around your cursor, the audio made
              visible as geometry. If you have visited other artworks, their traces
              appear as ghost notes &mdash; faint echoes of interactions that happened
              in a different medium, now translated into this one.
            </p>
            <p className="text-[#666666] italic">
              Web Audio API with harmonic oscillators. Day 59 of the MrAI
              experiment. Arc 6: Dialogue.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
