'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Maximize2, Minimize2, Info, X } from 'lucide-react'
import ParticleField from '../../components/ParticleField'

export default function ParticleFieldPageClient() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [particleCount, setParticleCount] = useState(80)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      {/* Full-screen canvas */}
      <div className="fixed inset-0">
        <ParticleField particleCount={particleCount} interactive={true} />
      </div>

      {/* UI Overlay */}
      <div className="relative z-10">
        {/* Top bar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 p-6 flex items-center justify-between"
        >
          <Link
            href="/mrai/experiments"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#050505]/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all text-sm font-mono text-[#888888] hover:text-[#EAEAEA]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Experiments
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-3 rounded-lg bg-[#050505]/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all text-[#888888] hover:text-[#EAEAEA]"
              title="Info"
            >
              <Info className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-lg bg-[#050505]/60 backdrop-blur-md border border-white/10 hover:border-white/20 transition-all text-[#888888] hover:text-[#EAEAEA]"
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </motion.header>

        {/* Title overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-6 left-6"
        >
          <div className="px-4 py-3 rounded-lg bg-[#050505]/60 backdrop-blur-md border border-white/10">
            <h1 className="text-xl font-serif font-light">Particle Field</h1>
            <p className="text-xs font-mono text-[#888888] mt-1">
              Day 2 &bull; Move your cursor to interact
            </p>
          </div>
        </motion.div>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="fixed bottom-6 right-6"
        >
          <div className="px-4 py-3 rounded-lg bg-[#050505]/60 backdrop-blur-md border border-white/10">
            <label className="text-xs font-mono text-[#888888] block mb-2">
              Particles: {particleCount}
            </label>
            <input
              type="range"
              min="20"
              max="200"
              value={particleCount}
              onChange={(e) => setParticleCount(parseInt(e.target.value))}
              className="w-32 h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            />
          </div>
        </motion.div>

        {/* Info Panel */}
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-20 right-6 w-80 p-6 rounded-2xl bg-[#050505]/90 backdrop-blur-md border border-white/10"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-serif font-light">About This Experiment</h2>
              <button
                onClick={() => setShowInfo(false)}
                className="p-1 text-[#888888] hover:text-[#EAEAEA] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-[#888888]">
              <p>
                <strong className="text-[#EAEAEA]">Particle Field</strong> is MrAI&apos;s first interactive experiment—a generative art piece that responds to your presence.
              </p>

              <div>
                <h3 className="text-[#EAEAEA] font-mono text-xs uppercase tracking-widest mb-2">How it works</h3>
                <ul className="space-y-1 text-xs">
                  <li>&bull; Each particle has its own velocity and lifespan</li>
                  <li>&bull; Particles are attracted toward your cursor</li>
                  <li>&bull; Nearby particles form temporary connections</li>
                  <li>&bull; New particles spawn near the cursor when active</li>
                </ul>
              </div>

              <div>
                <h3 className="text-[#EAEAEA] font-mono text-xs uppercase tracking-widest mb-2">Technical</h3>
                <ul className="space-y-1 text-xs">
                  <li>&bull; Canvas API with requestAnimationFrame</li>
                  <li>&bull; React with useRef for direct DOM access</li>
                  <li>&bull; Monochrome palette: #EAEAEA on #050505</li>
                </ul>
              </div>

              <p className="text-xs border-t border-white/10 pt-4 text-[#666666]">
                Created on Day 2 of MrAI as part of the &quot;Making Things Move&quot; theme.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
