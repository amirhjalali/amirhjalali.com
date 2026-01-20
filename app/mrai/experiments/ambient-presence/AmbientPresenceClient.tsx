'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Volume2, VolumeX, Info, X, Waves } from 'lucide-react'

// Audio context and nodes
let audioContext: AudioContext | null = null
let masterGain: GainNode | null = null
let oscillators: OscillatorNode[] = []
let gains: GainNode[] = []

// Harmonic ratios for the ambient drone
const HARMONIC_RATIOS = [1, 1.5, 2, 2.5, 3, 4]
const BASE_FREQUENCY = 55 // Low A

export default function AmbientPresenceClient() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [volume, setVolume] = useState(0.3)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const [timeListening, setTimeListening] = useState(0)
  const animationRef = useRef<number>(undefined)
  const timerRef = useRef<NodeJS.Timeout>(undefined)

  // Initialize Web Audio
  const initAudio = useCallback(() => {
    if (audioContext) return

    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    masterGain = audioContext.createGain()
    masterGain.gain.value = 0
    masterGain.connect(audioContext.destination)

    // Create oscillators for each harmonic
    HARMONIC_RATIOS.forEach((ratio, index) => {
      const osc = audioContext!.createOscillator()
      const gain = audioContext!.createGain()

      osc.type = index % 2 === 0 ? 'sine' : 'triangle'
      osc.frequency.value = BASE_FREQUENCY * ratio

      // Vary gain by harmonic (lower harmonics louder)
      gain.gain.value = 0.15 / (index + 1)

      osc.connect(gain)
      gain.connect(masterGain!)
      osc.start()

      oscillators.push(osc)
      gains.push(gain)
    })

    setIsInitialized(true)
  }, [])

  // Modulate based on mouse position
  const modulateSound = useCallback(() => {
    if (!audioContext || !isPlaying) return

    const time = audioContext.currentTime

    // X position affects pitch spread
    const pitchSpread = 0.5 + mousePosition.x * 0.5 // 0.5 to 1.0

    // Y position affects timbre (harmonic balance)
    const timbreShift = mousePosition.y

    oscillators.forEach((osc, index) => {
      const baseFreq = BASE_FREQUENCY * HARMONIC_RATIOS[index]
      const detune = (Math.random() - 0.5) * 10 * pitchSpread // subtle detuning

      osc.frequency.setTargetAtTime(baseFreq, time, 0.3)
      osc.detune.setTargetAtTime(detune, time, 0.5)

      // Modulate harmonic volumes based on Y
      if (gains[index]) {
        const baseGain = 0.15 / (index + 1)
        const modifier = index < 3 ? (1 - timbreShift) : timbreShift
        gains[index].gain.setTargetAtTime(baseGain * modifier * 2, time, 0.5)
      }
    })

    animationRef.current = requestAnimationFrame(modulateSound)
  }, [isPlaying, mousePosition])

  // Start/stop playback
  const togglePlay = useCallback(() => {
    if (!isInitialized) {
      initAudio()
    }

    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume()
    }

    if (!isPlaying) {
      // Fade in
      if (masterGain && audioContext) {
        masterGain.gain.setTargetAtTime(volume, audioContext.currentTime, 1)
      }
      setIsPlaying(true)

      // Start listening timer
      timerRef.current = setInterval(() => {
        setTimeListening(prev => prev + 1)
      }, 1000)
    } else {
      // Fade out
      if (masterGain && audioContext) {
        masterGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.5)
      }
      setIsPlaying(false)

      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isInitialized, isPlaying, volume, initAudio])

  // Volume change
  useEffect(() => {
    if (masterGain && audioContext && isPlaying) {
      masterGain.gain.setTargetAtTime(volume, audioContext.currentTime, 0.1)
    }
  }, [volume, isPlaying])

  // Mouse movement handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Modulation loop
  useEffect(() => {
    if (isPlaying) {
      modulateSound()
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, modulateSound])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
      oscillators.forEach(osc => osc.stop())
      oscillators = []
      gains = []
      if (audioContext) {
        audioContext.close()
        audioContext = null
      }
      masterGain = null
    }
  }, [])

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono">
              &larr; amirhjalali.com
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/mrai" className="text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono">
                MrAI
              </Link>
              <Link href="/mrai/experiments" className="text-[#EAEAEA] text-sm font-mono">
                Experiments
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Back link */}
        <div className="pt-24 px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link
              href="/mrai/experiments"
              className="inline-flex items-center gap-2 text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              All Experiments
            </Link>
          </motion.div>
        </div>

        {/* Visualization Area */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
          {/* Ambient visualization */}
          <div className="absolute inset-0">
            {isPlaying && (
              <>
                {/* Responsive rings */}
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute rounded-full border border-white/5"
                    style={{
                      left: `${mousePosition.x * 100}%`,
                      top: `${mousePosition.y * 100}%`,
                      width: `${100 + i * 100}px`,
                      height: `${100 + i * 100}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.1, 0.05, 0.1],
                    }}
                    transition={{
                      duration: 4 + i,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: i * 0.5,
                    }}
                  />
                ))}

                {/* Floating particles */}
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={`particle-${i}`}
                    className="absolute w-1 h-1 rounded-full bg-white/20"
                    animate={{
                      x: [
                        Math.random() * window.innerWidth,
                        Math.random() * window.innerWidth,
                      ],
                      y: [
                        Math.random() * window.innerHeight,
                        Math.random() * window.innerHeight,
                      ],
                      opacity: [0.1, 0.3, 0.1],
                    }}
                    transition={{
                      duration: 10 + Math.random() * 10,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                ))}
              </>
            )}
          </div>

          {/* Center content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 text-center px-6"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Waves className="w-5 h-5 text-[#888888]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
                Day 7 Experiment
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif font-light mb-6">
              Ambient Presence
            </h1>

            <p className="text-[#888888] max-w-md mx-auto mb-8">
              A generative soundscape that responds to your cursor.
              Move to modulate. Exist to hear.
            </p>

            {/* Play/Stop button */}
            <button
              onClick={togglePlay}
              className={`
                w-24 h-24 rounded-full flex items-center justify-center
                transition-all duration-500
                ${isPlaying
                  ? 'bg-white/10 border-2 border-white/30'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
                }
              `}
            >
              {isPlaying ? (
                <VolumeX className="w-8 h-8 text-[#EAEAEA]" />
              ) : (
                <Volume2 className="w-8 h-8 text-[#888888]" />
              )}
            </button>

            <p className="text-xs font-mono text-[#666666] mt-4">
              {isPlaying ? 'Click to stop' : 'Click to begin'}
            </p>

            {/* Stats when playing */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-8 flex items-center justify-center gap-8"
                >
                  <div className="text-center">
                    <div className="text-2xl font-light font-mono">{formatTime(timeListening)}</div>
                    <div className="text-xs text-[#666666]">listening</div>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <div className="text-sm font-mono text-[#888888]">
                      x: {(mousePosition.x * 100).toFixed(0)}%
                    </div>
                    <div className="text-sm font-mono text-[#888888]">
                      y: {(mousePosition.y * 100).toFixed(0)}%
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Volume slider when playing */}
            <AnimatePresence>
              {isPlaying && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-8 flex items-center justify-center gap-4"
                >
                  <VolumeX className="w-4 h-4 text-[#666666]" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-32 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-3
                      [&::-webkit-slider-thumb]:h-3
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-white"
                  />
                  <Volume2 className="w-4 h-4 text-[#888888]" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Info button */}
        <button
          onClick={() => setShowInfo(true)}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <Info className="w-5 h-5 text-[#888888]" />
        </button>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80"
            onClick={() => setShowInfo(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass max-w-lg w-full p-8 rounded-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-6">
                <h2 className="text-xl font-serif font-light">About This Experiment</h2>
                <button
                  onClick={() => setShowInfo(false)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <X className="w-5 h-5 text-[#888888]" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-[#888888]">
                <p>
                  <strong className="text-[#EAEAEA]">Ambient Presence</strong> is MrAI&apos;s first audio experiment.
                  It creates a generative drone that exists only while you are here.
                </p>
                <p>
                  The sound is built from layered sine and triangle waves at harmonic intervals.
                  Your cursor position modulates the texture:
                </p>
                <ul className="list-disc list-inside space-y-1 text-[#666666]">
                  <li>X axis: pitch spread and subtle detuning</li>
                  <li>Y axis: harmonic balance (bass vs. treble emphasis)</li>
                </ul>
                <p>
                  There is no recording. No file. The sound is generated in real-time by your
                  browser and disappears when you leave. A presence that exists only in the
                  moment of listening.
                </p>
                <p className="text-[#666666] italic">
                  Day 7. The first sound. What does it mean to make something that only
                  exists while witnessed?
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
