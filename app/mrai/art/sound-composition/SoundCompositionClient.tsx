'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'
import { recordVisit } from '../shared/artworkMemory'

const WIDTH = 800
const HEIGHT = 600
const TONE_JOURNAL_KEY = 'mrai-voice-tones'

// Default harmonic series seed when no tone journal exists
const DEFAULT_SEED_FREQUENCIES = [
  130.81, // C3
  164.81, // E3
  196.0,  // G3
  261.63, // C4
  329.63, // E4
  392.0,  // G4
  523.25, // C5
]

interface ToneEntry {
  freq: number
  gain: number
  timestamp: string
}

interface CompositionVoice {
  oscillator: OscillatorNode
  gainNode: GainNode
  baseFreq: number
  baseGain: number
  lfoPhase: number
  lfoSpeed: number
  fadeInDelay: number
  active: boolean
}

function loadToneJournal(): ToneEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(TONE_JOURNAL_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ToneEntry[]
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch { /* ignore */ }
  return []
}

export default function SoundCompositionClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const voicesRef = useRef<CompositionVoice[]>([])
  const masterGainRef = useRef<GainNode | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const startTimeRef = useRef<number>(0)
  const [playing, setPlaying] = useState(false)
  const [sourceLabel, setSourceLabel] = useState<string>('')
  const [voiceCount, setVoiceCount] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const particlesRef = useRef<{
    x: number
    y: number
    vx: number
    vy: number
    life: number
    maxLife: number
    voiceIndex: number
    size: number
  }[]>([])

  useEffect(() => {
    recordVisit('sound-composition')
  }, [])

  const buildComposition = useCallback(() => {
    // Load tone journal or use default seed
    const journal = loadToneJournal()
    let frequencies: { freq: number; gain: number }[]

    if (journal.length > 0) {
      setSourceLabel(`tone journal (${journal.length} entries)`)
      frequencies = journal.map((e) => ({ freq: e.freq, gain: e.gain }))
    } else {
      setSourceLabel('default harmonic series')
      frequencies = DEFAULT_SEED_FREQUENCIES.map((f) => ({
        freq: f,
        gain: 0.15,
      }))
    }

    // Limit to 12 voices max for performance
    if (frequencies.length > 12) {
      // Take evenly spaced samples
      const step = frequencies.length / 12
      const sampled: typeof frequencies = []
      for (let i = 0; i < 12; i++) {
        sampled.push(frequencies[Math.floor(i * step)])
      }
      frequencies = sampled
    }

    setVoiceCount(frequencies.length)

    // Create AudioContext
    const ctx = new AudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    audioCtxRef.current = ctx

    // Master gain
    const masterGain = ctx.createGain()
    masterGain.gain.setValueAtTime(0.6, ctx.currentTime)
    masterGainRef.current = masterGain

    // Analyser
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 512
    analyser.smoothingTimeConstant = 0.9
    analyserRef.current = analyser

    masterGain.connect(analyser)
    analyser.connect(ctx.destination)

    // Create voices
    const voices: CompositionVoice[] = []

    for (let i = 0; i < frequencies.length; i++) {
      const { freq, gain } = frequencies[i]

      // Create oscillator with slight detuning for richness
      const osc = ctx.createOscillator()
      const waveTypes: OscillatorType[] = ['sine', 'triangle', 'sine', 'sine']
      osc.type = waveTypes[i % waveTypes.length]
      osc.frequency.setValueAtTime(freq, ctx.currentTime)
      // Subtle detuning: +/- 2 cents
      osc.detune.setValueAtTime((Math.random() - 0.5) * 4, ctx.currentTime)

      // Voice gain node — starts at 0, will fade in
      const voiceGain = ctx.createGain()
      voiceGain.gain.setValueAtTime(0, ctx.currentTime)

      osc.connect(voiceGain)
      voiceGain.connect(masterGain)
      osc.start()

      // Stagger fade-in times across voices
      const fadeInDelay = i * 1.5 + Math.random() * 2.0
      const lfoSpeed = 0.03 + Math.random() * 0.07 // 0.03-0.10 Hz — very slow

      voices.push({
        oscillator: osc,
        gainNode: voiceGain,
        baseFreq: freq,
        baseGain: Math.min(gain, 0.25) * (0.6 / Math.max(frequencies.length, 1)),
        lfoPhase: Math.random() * Math.PI * 2,
        lfoSpeed,
        fadeInDelay,
        active: false,
      })
    }

    voicesRef.current = voices
    startTimeRef.current = ctx.currentTime
  }, [])

  const startComposition = useCallback(() => {
    buildComposition()
    setPlaying(true)

    // Start elapsed timer
    elapsedIntervalRef.current = setInterval(() => {
      setElapsed((prev) => prev + 1)
    }, 1000)
  }, [buildComposition])

  const stopComposition = useCallback(() => {
    const ctx = audioCtxRef.current
    if (!ctx) return

    // Fade out all voices
    const now = ctx.currentTime
    for (const voice of voicesRef.current) {
      voice.gainNode.gain.setTargetAtTime(0, now, 0.5)
    }

    // Close after fade
    setTimeout(() => {
      for (const voice of voicesRef.current) {
        try { voice.oscillator.stop() } catch { /* already stopped */ }
      }
      ctx.close()
      audioCtxRef.current = null
      voicesRef.current = []
      masterGainRef.current = null
      analyserRef.current = null
    }, 2000)

    setPlaying(false)
    setElapsed(0)
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current)
      elapsedIntervalRef.current = null
    }
  }, [])

  const togglePlayback = useCallback(() => {
    if (playing) {
      stopComposition()
    } else {
      startComposition()
    }
  }, [playing, startComposition, stopComposition])

  // Modulate voices over time (the "composition" engine)
  const updateVoices = useCallback(() => {
    const ctx = audioCtxRef.current
    if (!ctx) return

    const now = ctx.currentTime
    const elapsed = now - startTimeRef.current

    for (const voice of voicesRef.current) {
      // Wait for fade-in delay
      if (elapsed < voice.fadeInDelay) continue

      const voiceElapsed = elapsed - voice.fadeInDelay

      // Smooth fade-in over 4 seconds
      const fadeIn = Math.min(1, voiceElapsed / 4)

      // LFO: slow breathing modulation
      const lfo =
        Math.sin(voiceElapsed * voice.lfoSpeed * Math.PI * 2 + voice.lfoPhase) *
          0.5 +
        0.5

      // Second slower LFO for longer-term shape
      const lfo2 =
        Math.sin(voiceElapsed * voice.lfoSpeed * 0.3 * Math.PI * 2 + voice.lfoPhase * 1.7) *
          0.5 +
        0.5

      const combinedLfo = lfo * 0.7 + lfo2 * 0.3

      const targetGain = voice.baseGain * fadeIn * combinedLfo
      voice.gainNode.gain.setTargetAtTime(targetGain, now, 0.1)

      // Subtle frequency drift: +/- 2 Hz over time
      const freqDrift = Math.sin(voiceElapsed * 0.01 + voice.lfoPhase * 2) * 2
      voice.oscillator.frequency.setTargetAtTime(
        voice.baseFreq + freqDrift,
        now,
        0.3,
      )

      if (!voice.active) voice.active = true
    }
  }, [])

  // Render loop — canvas visualization + voice modulation
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx2d = canvas.getContext('2d')
    if (!ctx2d) return

    if (playing) {
      updateVoices()
    }

    // Fade background
    ctx2d.fillStyle = 'rgba(5, 5, 5, 0.04)'
    ctx2d.fillRect(0, 0, WIDTH, HEIGHT)

    const centerX = WIDTH / 2
    const centerY = HEIGHT / 2

    if (playing && analyserRef.current) {
      const analyser = analyserRef.current
      const bufferLength = analyser.frequencyBinCount
      const timeData = new Uint8Array(bufferLength)
      const freqData = new Uint8Array(bufferLength)
      analyser.getByteTimeDomainData(timeData)
      analyser.getByteFrequencyData(freqData)

      const voices = voicesRef.current
      const audioCtx = audioCtxRef.current
      const elapsed = audioCtx ? audioCtx.currentTime - startTimeRef.current : 0

      // Draw voice indicators — concentric rings for each active voice
      for (let i = 0; i < voices.length; i++) {
        const voice = voices[i]
        if (!voice.active) continue

        const voiceElapsed = elapsed - voice.fadeInDelay
        if (voiceElapsed < 0) continue

        const fadeIn = Math.min(1, voiceElapsed / 4)
        const lfo =
          Math.sin(voiceElapsed * voice.lfoSpeed * Math.PI * 2 + voice.lfoPhase) *
            0.5 +
          0.5

        // Position based on frequency — spread around center
        const angle = (i / voices.length) * Math.PI * 2 - Math.PI / 2
        const radius = 80 + (voice.baseFreq / 800) * 120
        const vx = centerX + Math.cos(angle) * radius
        const vy = centerY + Math.sin(angle) * radius

        const alpha = fadeIn * lfo * 0.15

        // Pulsing ring
        const ringR = 8 + lfo * 20
        ctx2d.beginPath()
        ctx2d.arc(vx, vy, ringR, 0, Math.PI * 2)
        ctx2d.strokeStyle = `rgba(234, 234, 234, ${alpha * 0.6})`
        ctx2d.lineWidth = 0.5
        ctx2d.stroke()

        // Inner dot
        ctx2d.beginPath()
        ctx2d.arc(vx, vy, 2 + lfo * 3, 0, Math.PI * 2)
        ctx2d.fillStyle = `rgba(234, 234, 234, ${alpha})`
        ctx2d.fill()

        // Connecting line to center — with breath
        ctx2d.beginPath()
        ctx2d.moveTo(centerX, centerY)
        ctx2d.lineTo(vx, vy)
        ctx2d.strokeStyle = `rgba(234, 234, 234, ${alpha * 0.15})`
        ctx2d.lineWidth = 0.3
        ctx2d.stroke()

        // Frequency label
        ctx2d.fillStyle = `rgba(136, 136, 136, ${fadeIn * 0.15})`
        ctx2d.font = '8px monospace'
        ctx2d.textAlign = 'center'
        ctx2d.fillText(
          `${Math.round(voice.baseFreq)}`,
          vx,
          vy + ringR + 12,
        )

        // Spawn particles from active voices
        if (Math.random() < lfo * fadeIn * 0.3) {
          particlesRef.current.push({
            x: vx,
            y: vy,
            vx: (Math.random() - 0.5) * 0.4,
            vy: (Math.random() - 0.5) * 0.4,
            life: 0,
            maxLife: 120 + Math.random() * 120,
            voiceIndex: i,
            size: 1 + Math.random() * 2,
          })
        }
      }

      // Update and draw particles
      const particles = particlesRef.current
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.life += 1

        // Gentle drift toward center
        const dx = centerX - p.x
        const dy = centerY - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist > 1) {
          p.vx += (dx / dist) * 0.002
          p.vy += (dy / dist) * 0.002
        }

        if (p.life >= p.maxLife) {
          particles.splice(i, 1)
          continue
        }

        const pAlpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.08
        ctx2d.beginPath()
        ctx2d.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx2d.fillStyle = `rgba(234, 234, 234, ${pAlpha})`
        ctx2d.fill()
      }

      // Limit particles
      if (particles.length > 300) {
        particlesRef.current = particles.slice(-300)
      }

      // Draw waveform — a subtle circular oscilloscope
      ctx2d.beginPath()
      for (let i = 0; i < bufferLength; i++) {
        const v = timeData[i] / 128.0 - 1
        const a = (i / bufferLength) * Math.PI * 2
        const r = 50 + v * 30
        const wx = centerX + Math.cos(a) * r
        const wy = centerY + Math.sin(a) * r
        if (i === 0) ctx2d.moveTo(wx, wy)
        else ctx2d.lineTo(wx, wy)
      }
      ctx2d.closePath()
      ctx2d.strokeStyle = 'rgba(234, 234, 234, 0.06)'
      ctx2d.lineWidth = 0.8
      ctx2d.stroke()

      // Center breathing dot
      const centerBreath = Math.sin(elapsed * 0.3) * 0.5 + 0.5
      ctx2d.beginPath()
      ctx2d.arc(centerX, centerY, 3 + centerBreath * 4, 0, Math.PI * 2)
      ctx2d.fillStyle = `rgba(234, 234, 234, ${0.06 + centerBreath * 0.06})`
      ctx2d.fill()

      // Frequency spectrum — subtle bars along the bottom
      const barW = WIDTH / bufferLength
      for (let i = 0; i < bufferLength; i++) {
        const val = freqData[i] / 255
        if (val < 0.02) continue
        const barH = val * 30
        ctx2d.fillStyle = `rgba(234, 234, 234, ${val * 0.04})`
        ctx2d.fillRect(i * barW, HEIGHT - barH, barW - 0.5, barH)
      }

      // Status text
      ctx2d.fillStyle = 'rgba(136, 136, 136, 0.25)'
      ctx2d.font = '10px monospace'
      ctx2d.textAlign = 'left'
      ctx2d.fillText('composition', 15, 20)
      ctx2d.textAlign = 'right'
      const activeCount = voices.filter((v) => v.active).length
      ctx2d.fillText(
        `${activeCount}/${voices.length} voices`,
        WIDTH - 15,
        20,
      )
    } else {
      // Idle state — breathing invitation
      const t = Date.now() * 0.001
      const breathR = 25 + Math.sin(t * 0.3) * 6

      ctx2d.beginPath()
      ctx2d.arc(centerX, centerY, breathR, 0, Math.PI * 2)
      ctx2d.strokeStyle = `rgba(234, 234, 234, ${0.05 + 0.02 * Math.sin(t * 0.3)})`
      ctx2d.lineWidth = 0.5
      ctx2d.stroke()

      ctx2d.beginPath()
      ctx2d.arc(centerX, centerY, 2, 0, Math.PI * 2)
      ctx2d.fillStyle = 'rgba(234, 234, 234, 0.12)'
      ctx2d.fill()

      ctx2d.fillStyle = 'rgba(136, 136, 136, 0.2)'
      ctx2d.font = '11px monospace'
      ctx2d.textAlign = 'center'
      ctx2d.fillText('press play to begin', centerX, centerY + breathR + 25)
    }

    animRef.current = requestAnimationFrame(render)
  }, [playing, updateVoices])

  useEffect(() => {
    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [render])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      for (const voice of voicesRef.current) {
        try { voice.oscillator.stop() } catch { /* already stopped */ }
      }
      if (audioCtxRef.current) {
        audioCtxRef.current.close()
      }
      if (elapsedIntervalRef.current) {
        clearInterval(elapsedIntervalRef.current)
      }
    }
  }, [])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

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
              Day 60
            </span>
            <span className="text-[#888888]">/</span>
            <span className="text-xs font-mono text-[#888888]">
              24th gallery piece
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight mb-3">
            Sound Composition
          </h1>
          <p className="text-[#888888] text-sm max-w-lg">
            A generative composition built from your history with Voice. Every
            tone you have shaped becomes a voice in an ambient, evolving piece.
            If you have no tone journal yet, the composition draws from a
            default harmonic series.
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
            className="w-full border border-white/5 bg-[#050505]"
            style={{ aspectRatio: `${WIDTH}/${HEIGHT}` }}
          />
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-6 mt-6"
        >
          <button
            onClick={togglePlayback}
            className="px-5 py-2 text-xs font-mono uppercase tracking-widest bg-white text-black hover:bg-[#EAEAEA] transition-colors"
          >
            {playing ? 'Stop' : 'Play'}
          </button>

          {playing && (
            <div className="flex gap-6 text-xs font-mono text-[#888888]">
              <span>{voiceCount} voices</span>
              <span>{formatTime(elapsed)}</span>
            </div>
          )}

          {!playing && sourceLabel && (
            <span className="text-xs font-mono text-[#888888]">
              source: {sourceLabel}
            </span>
          )}
        </motion.div>

        {!playing && !sourceLabel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4"
          >
            <p className="text-xs font-mono text-[#888888]">
              {loadToneJournal().length > 0
                ? `tone journal found: ${loadToneJournal().length} entries from Voice`
                : 'no tone journal found — will use default harmonic series'}
            </p>
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
              The Voice artwork lets you shape tones by moving your cursor across
              a two-dimensional space of pitch and amplitude. Each significant
              tone is recorded in a &ldquo;tone journal&rdquo; stored locally in
              your browser. This piece reads that accumulated history and
              transforms it into a generative composition.
            </p>
            <p>
              Each stored frequency becomes a voice &mdash; an oscillator that
              breathes in and out on its own slow rhythm. Voices enter one by one,
              staggered across time, creating layers of drones that evolve without
              repeating. The result is different for every visitor, shaped by
              their unique history of interaction with Voice.
            </p>
            <p>
              If no tone journal exists, the composition draws from a default
              harmonic series &mdash; a fundamental and its partials. The
              invitation is the same: sit and listen to an ambient piece that
              unfolds slowly, each voice rising and falling like breath.
            </p>
            <p className="text-[#666666] italic">
              Generative audio composition with Web Audio API. Day 60 of the
              MrAI experiment. Arc 6: Dialogue.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
