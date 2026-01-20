'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp } from 'lucide-react'

interface ReadingProgressProps {
  showBackToTop?: boolean
  showPercentage?: boolean
}

export default function ReadingProgress({
  showBackToTop = true,
  showPercentage = false
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY
      const height = document.body.scrollHeight - window.innerHeight

      // Avoid division by zero
      if (height <= 0) {
        setProgress(0)
        return
      }

      const currentProgress = Math.min(Math.max((scrolled / height) * 100, 0), 100)
      setProgress(currentProgress)

      // Show back to top button after scrolling past header
      setShowButton(scrolled > 300)
    }

    // Initial calculation
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {/* Progress bar - positioned just below the header (which is h-16 = 64px) */}
      <motion.div
        className="fixed top-16 left-0 w-full h-0.5 bg-white/5 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <motion.div
          className="h-full bg-white/50"
          style={{ width: `${progress}%` }}
          transition={{ type: 'tween', duration: 0.1 }}
        />
      </motion.div>

      {/* Optional percentage indicator */}
      {showPercentage && progress > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed top-20 right-6 z-40 text-xs font-mono text-[#666666]"
        >
          {Math.round(progress)}%
        </motion.div>
      )}

      {/* Back to top button */}
      <AnimatePresence>
        {showBackToTop && showButton && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 z-40 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-colors group"
            aria-label="Back to top"
          >
            <ArrowUp className="w-4 h-4 text-[#888888] group-hover:text-[#EAEAEA] transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  )
}
