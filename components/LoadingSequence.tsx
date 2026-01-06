'use client'

import { useState, useEffect, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LoadingSequenceProps {
  children: ReactNode
  minDisplayTime?: number
  enabled?: boolean
}

export function LoadingSequence({
  children,
  minDisplayTime = 1200,
  enabled = true,
}: LoadingSequenceProps) {
  const [isLoading, setIsLoading] = useState(enabled)

  useEffect(() => {
    if (!enabled) return

    // Minimum display time for brand impact
    const timer = setTimeout(() => setIsLoading(false), minDisplayTime)
    return () => clearTimeout(timer)
  }, [enabled, minDisplayTime])

  if (!enabled) {
    return <>{children}</>
  }

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-[9999] bg-[#050505] flex items-center justify-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Animated initials */}
              <motion.h1
                className="text-4xl font-serif font-light text-[#EAEAEA]"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                AHJ
              </motion.h1>

              {/* Subtle loading indicator */}
              <motion.div
                className="mt-6 w-12 h-px bg-white/20 mx-auto overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="h-full bg-white"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </>
  )
}

export default LoadingSequence
