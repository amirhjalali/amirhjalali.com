'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface MagneticWrapperProps {
  children: React.ReactNode
  className?: string
  magneticStrength?: number
  springConfig?: {
    damping?: number
    stiffness?: number
  }
}

export function MagneticWrapper({ 
  children, 
  className = "",
  magneticStrength = 0.3,
  springConfig = { damping: 15, stiffness: 150 }
}: MagneticWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)
  
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    
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
    setIsHovered(true)
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
          ease: "easeOut"
        }
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}