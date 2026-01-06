'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { springConfigs } from '@/lib/motion'
import { shouldUseComplexAnimations } from '@/lib/performance'

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [shouldRender, setShouldRender] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)

  const cursorXSpring = useSpring(cursorX, springConfigs.snappy)
  const cursorYSpring = useSpring(cursorY, springConfigs.snappy)

  const moveCursor = useCallback((e: MouseEvent) => {
    cursorX.set(e.clientX)
    cursorY.set(e.clientY)
    if (!isVisible) setIsVisible(true)
  }, [cursorX, cursorY, isVisible])

  useEffect(() => {
    // Check if device supports custom cursor
    // Only render on non-touch, high-performance devices
    const checkDevice = () => {
      const isMobile = window.matchMedia('(pointer: coarse)').matches
      const hasPerformance = shouldUseComplexAnimations()
      setShouldRender(!isMobile && hasPerformance)
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)

    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  useEffect(() => {
    if (!shouldRender) return

    const handleHoverStart = () => setIsHovering(true)
    const handleHoverEnd = () => setIsHovering(false)

    window.addEventListener('mousemove', moveCursor)
    window.addEventListener('mouseenter', () => setIsVisible(true))
    window.addEventListener('mouseleave', () => setIsVisible(false))

    // Add hover detection for interactive elements
    const interactiveElements = document.querySelectorAll('a, button, [role="button"], input, textarea, select, [tabindex]:not([tabindex="-1"])')
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', handleHoverStart)
      el.addEventListener('mouseleave', handleHoverEnd)
    })

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      interactiveElements.forEach(el => {
        el.removeEventListener('mouseenter', handleHoverStart)
        el.removeEventListener('mouseleave', handleHoverEnd)
      })
    }
  }, [shouldRender, moveCursor])

  // Don't render on mobile, touch devices, or low-performance devices
  if (!shouldRender) return null

  return (
    <>
      {/* Main cursor dot */}
      <motion.div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-white pointer-events-none z-[9999] mix-blend-difference"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          opacity: isVisible ? 1 : 0,
          scale: isHovering ? 0.5 : 1,
        }}
        transition={{ duration: 0.15 }}
      />

      {/* Hover ring */}
      <motion.div
        className="fixed top-0 left-0 w-10 h-10 rounded-full border border-white/30 pointer-events-none z-[9998]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          scale: isHovering ? 1.5 : 1,
          opacity: isVisible ? (isHovering ? 1 : 0.5) : 0,
        }}
        transition={{ duration: 0.2 }}
      />
    </>
  )
}

export default CustomCursor
