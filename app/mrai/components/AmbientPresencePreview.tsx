'use client'

import { motion } from 'framer-motion'
import { Waves } from 'lucide-react'

export default function AmbientPresencePreview() {
  return (
    <div className="relative w-full h-full bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
      {/* Animated rings */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-white/10"
          style={{
            width: `${80 + i * 50}px`,
            height: `${80 + i * 50}px`,
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.05, 0.1],
          }}
          transition={{
            duration: 3 + i,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.3,
          }}
        />
      ))}

      {/* Center icon */}
      <motion.div
        className="relative z-10 p-4 rounded-full bg-white/5 border border-white/10"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <Waves className="w-8 h-8 text-[#888888]" />
      </motion.div>

      {/* Floating particles */}
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={`p-${i}`}
          className="absolute w-1 h-1 rounded-full bg-white/20"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${20 + Math.random() * 60}%`,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Label */}
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <span className="text-xs font-mono text-[#666666]">Audio experiment</span>
      </div>
    </div>
  )
}
