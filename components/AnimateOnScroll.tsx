'use client'

import { motion, useInView, Variants } from 'framer-motion'
import { useRef, ReactNode } from 'react'
import { fadeInUp, fadeIn, scaleIn, slideInLeft, slideInRight, durations, easings } from '@/lib/motion'

type AnimationType = 'fadeInUp' | 'fadeIn' | 'scaleIn' | 'slideInLeft' | 'slideInRight'

const animationVariants: Record<AnimationType, Variants> = {
  fadeInUp,
  fadeIn,
  scaleIn,
  slideInLeft,
  slideInRight,
}

interface AnimateOnScrollProps {
  children: ReactNode
  delay?: number
  className?: string
  animation?: AnimationType
  once?: boolean
  margin?: string
}

export function AnimateOnScroll({
  children,
  delay = 0,
  className,
  animation = 'fadeInUp',
  once = true,
  margin = '-100px',
}: AnimateOnScrollProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once, margin: margin as `${number}px` })

  const variants = animationVariants[animation]

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={variants}
      transition={{ delay, duration: durations.normal, ease: easings.smooth }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// Convenience components for common use cases
export function FadeInUp({
  children,
  delay,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <AnimateOnScroll animation="fadeInUp" delay={delay} className={className}>
      {children}
    </AnimateOnScroll>
  )
}

export function ScaleIn({
  children,
  delay,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <AnimateOnScroll animation="scaleIn" delay={delay} className={className}>
      {children}
    </AnimateOnScroll>
  )
}

export function SlideInLeft({
  children,
  delay,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <AnimateOnScroll animation="slideInLeft" delay={delay} className={className}>
      {children}
    </AnimateOnScroll>
  )
}

export function SlideInRight({
  children,
  delay,
  className,
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <AnimateOnScroll animation="slideInRight" delay={delay} className={className}>
      {children}
    </AnimateOnScroll>
  )
}

export default AnimateOnScroll
