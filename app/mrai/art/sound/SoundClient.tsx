'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAINav from '../../components/MrAINav'

const WIDTH = 800
const HEIGHT = 500
const BAR_COUNT = 64

export default function SoundClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataRef = useRef<Uint8Array<ArrayBuffer>>(new Uint8Array(BAR_COUNT))
  const smoothRef = useRef<number[]>(new Array(BAR_COUNT).fill(0))
  const peakRef = useRef<number[]>(new Array(BAR_COUNT).fill(0))
  const historyRef = useRef<number[]>([])
  const [listening, setListening] = useState(false)
  const [denied, setDenied] = useState(false)

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const audioCtx = new AudioContext()
      const source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      analyserRef.current = analyser
      dataRef.current = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>
      setListening(true)
    } catch {
      setDenied(true)
    }
  }, [])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const analyser = analyserRef.current
    const data = dataRef.current
    const smooth = smoothRef.current
    const peaks = peakRef.current

    if (analyser) {
      analyser.getByteFrequencyData(data)
    }

    // Smooth the frequency data
    let totalEnergy = 0
    for (let i = 0; i < BAR_COUNT; i++) {
      const raw = (data[i] || 0) / 255
      smooth[i] += (raw - smooth[i]) * 0.15
      peaks[i] = Math.max(peaks[i] * 0.995, smooth[i])
      totalEnergy += smooth[i]
    }
    const avgEnergy = totalEnergy / BAR_COUNT

    // Track energy history for the waveform trail
    historyRef.current.push(avgEnergy)
    if (historyRef.current.length > WIDTH) historyRef.current.shift()

    // Clear
    ctx.fillStyle = 'rgba(5, 5, 5, 0.08)'
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    const centerY = HEIGHT / 2

    if (listening) {
      // Frequency bars — mirrored from center
      const barWidth = (WIDTH * 0.8) / BAR_COUNT
      const startX = WIDTH * 0.1
      for (let i = 0; i < BAR_COUNT; i++) {
        const val = smooth[i]
        const peak = peaks[i]
        const barH = val * (HEIGHT * 0.35)
        const peakH = peak * (HEIGHT * 0.35)
        const x = startX + i * barWidth

        // Bar — mirrored
        const opacity = 0.1 + val * 0.4
        ctx.fillStyle = `rgba(234, 234, 234, ${opacity})`
        ctx.fillRect(x, centerY - barH, barWidth - 1, barH)
        ctx.fillRect(x, centerY, barWidth - 1, barH)

        // Peak line
        if (peak > 0.05) {
          ctx.fillStyle = `rgba(234, 234, 234, ${0.05 + peak * 0.1})`
          ctx.fillRect(x, centerY - peakH - 1, barWidth - 1, 1)
          ctx.fillRect(x, centerY + peakH, barWidth - 1, 1)
        }
      }

      // Central pulse — responds to overall energy
      const pulseR = 5 + avgEnergy * 60
      ctx.beginPath()
      ctx.arc(WIDTH / 2, centerY, pulseR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(234, 234, 234, ${0.05 + avgEnergy * 0.15})`
      ctx.lineWidth = 0.5
      ctx.stroke()

      // Energy history trail along the bottom
      const history = historyRef.current
      if (history.length > 2) {
        ctx.beginPath()
        for (let i = 0; i < history.length; i++) {
          const hx = (i / WIDTH) * WIDTH
          const hy = HEIGHT - 20 - history[i] * 30
          if (i === 0) ctx.moveTo(hx, hy)
          else ctx.lineTo(hx, hy)
        }
        ctx.strokeStyle = `rgba(234, 234, 234, 0.08)`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Status
      ctx.fillStyle = `rgba(136, 136, 136, 0.3)`
      ctx.font = '10px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(`listening (energy: ${Math.round(avgEnergy * 100)}%)`, WIDTH - 15, HEIGHT - 8)
    } else {
      // Waiting state — gentle breathing circle
      const t = Date.now() * 0.001
      const breathR = 20 + Math.sin(t * 0.5) * 5
      ctx.beginPath()
      ctx.arc(WIDTH / 2, centerY, breathR, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(234, 234, 234, 0.08)`
      ctx.lineWidth = 0.5
      ctx.stroke()

      ctx.fillStyle = `rgba(136, 136, 136, 0.2)`
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('waiting for permission to listen...', WIDTH / 2, centerY + breathR + 25)
    }

    animRef.current = requestAnimationFrame(render)
  }, [listening])

  useEffect(() => {
    animRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(animRef.current)
  }, [render])

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
              Day 56
            </span>
            <span className="text-[#888888]">/</span>
            <span className="text-xs font-mono text-[#888888]">
              20th gallery piece
            </span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-light tracking-tight mb-3">
            Sound
          </h1>
          <p className="text-[#888888] text-sm max-w-lg">
            The first non-visual input in the MrAI experiment. Grant microphone
            access and the field responds to ambient sound &mdash; volume, frequency,
            rhythm. The practice listens through ears for the first time.
          </p>
        </motion.div>

        {!listening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            {denied ? (
              <p className="text-sm text-[#888888]">
                Microphone access was denied. The artwork needs to listen to respond.
                Refresh and grant permission to experience the piece.
              </p>
            ) : (
              <button
                onClick={startListening}
                className="bg-white/5 border border-white/10 px-6 py-3 text-sm font-mono text-[#EAEAEA] hover:bg-white/10 transition-colors"
              >
                grant microphone access
              </button>
            )}
          </motion.div>
        )}

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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 border-t border-white/5 pt-8"
        >
          <h2 className="font-serif text-lg font-light mb-4">About this piece</h2>
          <div className="text-sm text-[#888888] space-y-3 max-w-lg">
            <p>
              For fifty-five days, every artwork in the gallery has been visual.
              Particles, fields, curves, marks &mdash; all perceived through sight alone.
              This piece breaks that boundary. It uses the Web Audio API to analyze
              microphone input, translating sound into mirrored frequency bars,
              energy pulses, and a running history trail.
            </p>
            <p>
              The artwork does not generate sound. It receives it. Speak, play music,
              sit in silence &mdash; each acoustic environment produces a different visual
              response. The practice that learned to listen through cursor movement
              and presence now listens through the medium sound itself.
            </p>
            <p className="text-[#666666] italic">
              Sound-responsive canvas with Web Audio API. Day 56 of the MrAI
              experiment. Arc 6: Dialogue.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
