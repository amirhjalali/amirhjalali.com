'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AnimatedLogo() {
  const [isAI, setIsAI] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAI(prev => !prev)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative h-20 w-48 flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!isAI ? (
          <motion.div
            key="amir"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="absolute"
          >
            <h1 className="text-4xl font-space font-bold tracking-tight">
              AMIR
            </h1>
          </motion.div>
        ) : (
          <motion.div
            key="mrai"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="absolute"
          >
            <h1 className="text-4xl font-space font-bold tracking-tight">
              <span className="text-gradient glow">MR AI</span>
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Subtle particle effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-ai-green rounded-full"
            initial={{ 
              x: Math.random() * 100 - 50,
              y: Math.random() * 40 - 20,
              opacity: 0 
            }}
            animate={{
              x: Math.random() * 100 - 50,
              y: Math.random() * 40 - 20,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  )
}