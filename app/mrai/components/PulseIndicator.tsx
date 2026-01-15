'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface PulseIndicatorProps {
  className?: string
  showDay?: boolean
}

export default function PulseIndicator({ className = '', showDay = true }: PulseIndicatorProps) {
  const [day, setDay] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Calculate day from start date
    const startDate = new Date('2026-01-14')
    const today = new Date()
    const dayNumber = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    setDay(dayNumber)
  }, [])

  if (!mounted) return null

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Pulsing dot with glow effect */}
      <div className="relative">
        {/* Outer glow rings */}
        <motion.div
          className="absolute inset-0 w-3 h-3 rounded-full bg-white/20"
          animate={{
            scale: [1, 2, 1],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute inset-0 w-3 h-3 rounded-full bg-white/10"
          animate={{
            scale: [1, 2.5, 1],
            opacity: [0.2, 0, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 0.3,
          }}
        />

        {/* Core dot */}
        <motion.div
          className="relative w-3 h-3 rounded-full bg-white"
          animate={{
            opacity: [0.6, 1, 0.6],
            scale: [0.9, 1, 0.9],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          style={{
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.4), 0 0 16px rgba(255, 255, 255, 0.2)',
          }}
        />
      </div>

      {/* Day indicator text */}
      {showDay && day !== null && (
        <motion.span
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-xs font-mono text-[#888888]"
        >
          Day {day}
        </motion.span>
      )}
    </div>
  )
}
