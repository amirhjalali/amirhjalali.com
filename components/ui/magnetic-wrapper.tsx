'use client'

import React, { useRef, useState, useEffect, ReactNode } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'
import { springConfigs } from '@/lib/motion'

interface MagneticWrapperProps {
  children: ReactNode
  className?: string
  magneticStrength?: number
  springConfig?: {
    damping?: number
    stiffness?: number
  }
  disabled?: boolean
}

export function MagneticWrapper({
  children,
  className = '',
  magneticStrength = 0.3,
  springConfig = springConfigs.magnetic,
  disabled = false,
}: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  // Check if device is touch-based
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches)
    }
  }, [])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || disabled || isMobile) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    const distanceX = (event.clientX - centerX) * magneticStrength
    const distanceY = (event.clientY - centerY) * magneticStrength

    x.set(distanceX)
    y.set(distanceY)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
    setIsHovered(false)
  }

  const handleMouseEnter = () => {
    if (!disabled && !isMobile) {
      setIsHovered(true)
    }
  }

  // Don't apply magnetic effect on mobile
  if (isMobile || disabled) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        x: springX,
        y: springY,
      }}
      animate={{
        scale: isHovered ? 1.05 : 1,
      }}
      transition={{
        scale: {
          duration: 0.2,
          ease: 'easeOut',
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Simplified wrapper for buttons with customizable scale effect
interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  hoverScale?: number
  tapScale?: number
  onClick?: () => void
}

export function MagneticButton({
  children,
  className,
  strength = 0.3,
  hoverScale = 1.05,
  tapScale = 0.98,
  onClick,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springX = useSpring(x, springConfigs.magnetic)
  const springY = useSpring(y, springConfigs.magnetic)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.matchMedia('(pointer: coarse)').matches)
    }
  }, [])

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || isMobile) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    x.set((event.clientX - centerX) * strength)
    y.set((event.clientY - centerY) * strength)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  if (isMobile) {
    return (
      <motion.div
        whileTap={{ scale: tapScale }}
        onClick={onClick}
        className={className}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: hoverScale }}
      whileTap={{ scale: tapScale }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default MagneticWrapper
