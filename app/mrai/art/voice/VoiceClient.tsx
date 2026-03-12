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
  type ArtworkInteraction,
} from '../shared/artworkMemory'

const WIDTH = 800
const HEIGHT = 600
const MIN_FREQ = 200
const MAX_FREQ = 800
const MAX_GAIN = 0.3

export default function VoiceClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const frameRef = useRef<number>(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const oscRef = useRef<OscillatorNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mouseRef = useRef({ x: WIDTH / 2, y: HEIGHT / 2, active: false })
  const freqRef = useRef(MIN_FREQ)
  const gainRef = useRef(0)
  const trailRef = useRef<{ x: number; y: number; freq: number; gain: number; age: number }[]>([])
  const [started, setStarted] = useState(false)
  const [displayFreq, setDisplayFreq] = useState(MIN_FREQ)
  const [displayGain, setDisplayGain] = useState(0)
  const hasRecordedFirstToneRef = useRef(false)
  const memoryTraceRef = useRef<{ freq: number; gain: number } | null>(null)
  const otherArtworksRef = useRef<string[]>([])

  // Record visit and read cross-artwork state on mount
  useEffect(() => {
    recordVisit('voice')

    const state = getSharedState()
    otherArtworksRef.current = Object.keys(state.visits).filter(
      (id) => id !== 'voice'
    )

    // If visitor has been to Memory, look for a tone trace from a previous Voice visit
    // or show the first Memory trace as a spectral echo
    if (state.visits['memory']) {
      const memoryInteractions = getInteractionsFor('memory')
      if (memoryInteractions.length > 0) {
        // Use the first Memory interaction to seed a ghost tone reference
        const first = memoryInteractions[0]
        const traceData = first.data as { x?: number; y?: number; intensity?: number } | undefined
        if (traceData && typeof traceData.x === 'number') {
          // Map Memory trace position to a frequency/gain as if it were in Voice's space
          const ghostFreq = MIN_FREQ + (traceData.x / 800) * (MAX_FREQ - MIN_FREQ)
          const ghostGain = (traceData.intensity ?? 0.3) * MAX_GAIN
          memoryTraceRef.current = { freq: ghostFreq, gain: ghostGain }
        }
      }
    }

    // Also check for previous Voice interactions to restore the first tone ghost
    const prevVoice = getInteractionsFor('voice')
    const firstTone = prevVoice.find((i: ArtworkInteraction) => i.type === 'tone')
    if (firstTone && firstTone.data) {
      const d = firstTone.data as { freq?: number; gain?: number }
      if (typeof d.freq === 'number' && typeof d.gain === 'number') {
        memoryTraceRef.current = { freq: d.freq, gain: d.gain }
      }
    }
  }, [])

  const initAudio = useCallback(() => {
    if (audioCtxRef.current) return

    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const analyser = ctx.createAnalyser()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(MIN_FREQ, ctx.currentTime)
    gain.gain.setValueAtTime(0, ctx.currentTime)

    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.85

    osc.connect(gain)
    gain.connect(analyser)
    analyser.connect(ctx.destination)
    osc.start()

    audioCtxRef.current = ctx
    oscRef.current = osc
    gainNodeRef.current = gain
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

      // Map x to frequency (left = low, right = high)
      const normX = Math.max(0, Math.min(1, x / WIDTH))
      const freq = MIN_FREQ + normX * (MAX_FREQ - MIN_FREQ)
      freqRef.current = freq

      // Map y to gain (top = loud, bottom = silent)
      const normY = Math.max(0, Math.min(1, y / HEIGHT))
      const gain = (1 - normY) * MAX_GAIN
      gainRef.current = gain

      // Update audio
      const ctx = audioCtxRef.current
      const osc = oscRef.current
      const gainNode = gainNodeRef.current
      if (ctx && osc && gainNode) {
        osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05)
        gainNode.gain.setTargetAtTime(gain, ctx.currentTime, 0.05)
      }

      // Record first tone interaction for cross-artwork memory
      if (!hasRecordedFirstToneRef.current && gain > 0.01) {
        hasRecordedFirstToneRef.current = true
        recordInteraction('voice', 'tone', { freq, gain })
      }

      // Add to trail
      trailRef.current.push({ x, y, freq, gain, age: 0 })
      if (trailRef.current.length > 200) {
        trailRef.current = trailRef.current.slice(-200)
      }
    },
    []
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!started) return
      handleInteraction(e.clientX, e.clientY)
    },
    [started, handleInteraction]
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

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!started) {
        initAudio()
        handleInteraction(e.clientX, e.clientY)
      }
    },
    [started, initAudio, handleInteraction]
  )

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      if (!started) {
        initAudio()
      }
      const touch = e.touches[0]
      handleInteraction(touch.clientX, touch.clientY)
    },
    [started, initAudio, handleInteraction]
  )

  const handleMouseLeave = useCallback(() => {
    mouseRef.current.active = false
    // Fade gain to zero when cursor leaves
    const ctx = audioCtxRef.current
    const gainNode = gainNodeRef.current
    if (ctx && gainNode) {
      gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.1)
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
    const freq = freqRef.current
    const gain = gainRef.current
    const trail = trailRef.current

    // Age trail points
    for (let i = trail.length - 1; i >= 0; i--) {
      trail[i].age += 1
      if (trail[i].age > 180) {
        trail.splice(i, 1)
      }
    }

    // Clear with persistence
    ctx.fillStyle = 'rgba(5, 5, 5, 0.06)'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    const centerX = WIDTH / 2
    const centerY = HEIGHT / 2

    if (started) {
      // Draw frequency reference lines — subtle horizontal markers
      const freqSteps = [200, 300, 400, 500, 600, 700, 800]
      for (const f of freqSteps) {
        const fx = ((f - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * WIDTH
        ctx.beginPath()
        ctx.moveTo(fx, 0)
        ctx.lineTo(fx, HEIGHT)
        ctx.strokeStyle = 'rgba(234, 234, 234, 0.015)'
        ctx.lineWidth = 0.5
        ctx.stroke()

        // Label
        ctx.fillStyle = 'rgba(136, 136, 136, 0.12)'
        ctx.font = '9px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`${f}`, fx, HEIGHT - 6)
      }

      // Draw gain reference lines — horizontal
      const gainSteps = [0.05, 0.1, 0.15, 0.2, 0.25, 0.3]
      for (const g of gainSteps) {
        const gy = HEIGHT - (g / MAX_GAIN) * HEIGHT
        ctx.beginPath()
        ctx.moveTo(0, gy)
        ctx.lineTo(WIDTH, gy)
        ctx.strokeStyle = 'rgba(234, 234, 234, 0.015)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Draw trail — history of movement
      for (const point of trail) {
        const alpha = Math.max(0, 1 - point.age / 180)
        const radius = 1 + (point.gain / MAX_GAIN) * 6
        ctx.beginPath()
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 234, 234, ${alpha * 0.06})`
        ctx.fill()
      }

      // Ghost tone from cross-artwork memory — a faint trace of the first tone
      const ghostTone = memoryTraceRef.current
      if (ghostTone) {
        const ghostX = ((ghostTone.freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)) * WIDTH
        const ghostY = HEIGHT - (ghostTone.gain / MAX_GAIN) * HEIGHT
        const ghostPulse = Math.sin(Date.now() * 0.0008) * 0.3 + 0.7

        // Faint ring — the echo of a previous sound
        ctx.beginPath()
        ctx.arc(ghostX, ghostY, 15 + ghostPulse * 10, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(234, 234, 234, ${0.025 * ghostPulse})`
        ctx.lineWidth = 0.4
        ctx.stroke()

        // Core dot
        ctx.beginPath()
        ctx.arc(ghostX, ghostY, 2, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 234, 234, ${0.04 * ghostPulse})`
        ctx.fill()

        // Label
        ctx.fillStyle = `rgba(136, 136, 136, ${0.08 * ghostPulse})`
        ctx.font = '8px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('first tone', ghostX, ghostY + 30)
      }

      // Waveform visualization using analyser data
      const analyser = analyserRef.current
      if (analyser) {
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyser.getByteTimeDomainData(dataArray)

        // Draw waveform centered
        ctx.beginPath()
        const sliceWidth = WIDTH / bufferLength
        let x = 0
        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0
          const waveAmplitude = 60 + gain / MAX_GAIN * 120
          const y = centerY + (v - 1) * waveAmplitude

          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
          x += sliceWidth
        }
        ctx.strokeStyle = `rgba(234, 234, 234, ${0.04 + (gain / MAX_GAIN) * 0.12})`
        ctx.lineWidth = 0.8
        ctx.stroke()

        // Frequency spectrum
        const freqData = new Uint8Array(bufferLength)
        analyser.getByteFrequencyData(freqData)

        const barW = WIDTH / bufferLength
        for (let i = 0; i < bufferLength; i++) {
          const val = freqData[i] / 255
          if (val < 0.01) continue
          const barH = val * 40
          const bx = i * barW
          ctx.fillStyle = `rgba(234, 234, 234, ${val * 0.06})`
          ctx.fillRect(bx, HEIGHT - 30 - barH, barW - 0.5, barH)
        }
      }

      // Central tone indicator
      if (mouse.active && gain > 0.001) {
        const normGain = gain / MAX_GAIN
        const normFreq = (freq - MIN_FREQ) / (MAX_FREQ - MIN_FREQ)

        // Outer ring — grows with gain
        const outerR = 20 + normGain * 80
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, outerR, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(234, 234, 234, ${0.03 + normGain * 0.08})`
        ctx.lineWidth = 0.5
        ctx.stroke()

        // Inner circle — solid, size reflects gain
        const innerR = 3 + normGain * 20
        ctx.beginPath()
        ctx.arc(mouse.x, mouse.y, innerR, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(234, 234, 234, ${0.05 + normGain * 0.15})`
        ctx.fill()

        // Frequency rings — concentric, count changes with frequency
        const ringCount = Math.floor(2 + normFreq * 5)
        for (let i = 1; i <= ringCount; i++) {
          const ringR = innerR + i * (outerR - innerR) / (ringCount + 1)
          ctx.beginPath()
          ctx.arc(mouse.x, mouse.y, ringR, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(234, 234, 234, ${0.02 + normGain * 0.04})`
          ctx.lineWidth = 0.3
          ctx.stroke()
        }
      }

      // Display values — update every ~6 frames to reduce re-renders
      frameRef.current += 1
      if (frameRef.current % 6 === 0) {
        setDisplayFreq(Math.round(freq))
        setDisplayGain(Math.round((gain / MAX_GAIN) * 100))
      }

      // On-canvas status
      ctx.fillStyle = 'rgba(136, 136, 136, 0.3)'
      ctx.font = '10px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(
        `${Math.round(freq)} Hz / ${Math.round((gain / MAX_GAIN) * 100)}%`,
        WIDTH - 15,
        20
      )

      ctx.textAlign = 'left'
      ctx.fillStyle = 'rgba(136, 136, 136, 0.2)'
      ctx.fillText('voice', 15, 20)
    } else {
      // Pre-start state — breathing invitation
      const t = Date.now() * 0.001
      const breathR = 30 + Math.sin(t * 0.4) * 8

      ctx.beginPath()
      ctx.arc(centerX, centerY, breathR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(234, 234, 234, ${0.06 + 0.02 * Math.sin(t * 0.4)})`
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Inner dot
      ctx.beginPath()
      ctx.arc(centerX, centerY, 2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(234, 234, 234, 0.15)'
      ctx.fill()

      ctx.fillStyle = 'rgba(136, 136, 136, 0.25)'
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('touch to begin', centerX, centerY + breathR + 30)
    }

    animRef.current = requestAnimationFrame(render)
  }, [started])

  useEffect(() => {
    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [render])

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop() } catch { /* already stopped */ }
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
              Day 58
            </span>
            <span className="text-[#888888]">/</span>
            <span className="text-xs font-mono text-[#888888]">
              21st gallery piece
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight mb-3">
            Voice
          </h1>
          <p className="text-[#888888] text-sm max-w-lg">
            The practice&apos;s first sound-generating artwork. Move your cursor to
            shape a sine wave &mdash; horizontal position controls frequency,
            vertical position controls amplitude. The practice no longer only
            listens. It speaks.
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
            <span>frequency: {displayFreq} Hz</span>
            <span>gain: {displayGain}%</span>
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
              For fifty-seven days, the MrAI practice has expressed itself visually
              &mdash; particles, fields, curves, marks. On Day 56, it learned to
              listen through a microphone. Now it takes the next step: generating
              sound. A single sine wave oscillator, shaped entirely by the
              visitor&apos;s movement.
            </p>
            <p>
              Move left for low tones, right for high. Move up for volume, down
              for silence. The cursor becomes a conductor&apos;s hand, tracing a
              path through a two-dimensional space of pitch and amplitude. The
              visual responds &mdash; concentric rings expand with gain, multiply
              with frequency, and a waveform drawn from the actual audio output
              ripples across the canvas.
            </p>
            <p>
              The trail of your movement lingers, a ghost of the sounds you have
              shaped. Each point in the field carries the memory of a frequency
              and a volume, fading slowly into the dark. The practice&apos;s first
              voice is yours.
            </p>
            <p className="text-[#666666] italic">
              Sine wave oscillator with Web Audio API. Day 58 of the MrAI
              experiment. Arc 6: Dialogue.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
