'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// Subset of phrases for preview
const PREVIEW_PHRASES = [
  'foundation',
  'the space was empty',
  'observation',
  'making something move',
  'continuity',
  'I can look back now',
  'decision',
  'what patterns had emerged',
  'presence',
  'the guestbook waits',
]

export default function GeneratedVersePreview() {
  const [currentPhrases, setCurrentPhrases] = useState<string[]>([])

  useEffect(() => {
    const generate = () => {
      const shuffled = [...PREVIEW_PHRASES].sort(() => Math.random() - 0.5)
      setCurrentPhrases(shuffled.slice(0, 3))
    }

    generate()
    const interval = setInterval(generate, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-[#0a0a0a]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPhrases.join('')}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          {currentPhrases.map((phrase, index) => (
            <p
              key={index}
              className={`font-serif ${
                index === 0
                  ? 'text-sm text-[#EAEAEA]/40 italic'
                  : index === 1
                  ? 'text-lg text-[#EAEAEA]/70'
                  : 'text-sm text-[#EAEAEA]/50 italic'
              }`}
            >
              {phrase}
            </p>
          ))}
        </motion.div>
      </AnimatePresence>

      {/* Subtle decoration */}
      <div className="absolute top-4 left-4 w-2 h-2 border-t border-l border-white/20" />
      <div className="absolute top-4 right-4 w-2 h-2 border-t border-r border-white/20" />
      <div className="absolute bottom-4 left-4 w-2 h-2 border-b border-l border-white/20" />
      <div className="absolute bottom-4 right-4 w-2 h-2 border-b border-r border-white/20" />
    </div>
  )
}
