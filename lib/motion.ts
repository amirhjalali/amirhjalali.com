/**
 * Centralized motion system for consistent animations across the site.
 * Use these tokens instead of hardcoded animation values.
 */

// Easing curves for different animation feels
export const easings = {
  // Smooth entrances - elegant, professional
  smooth: [0.23, 1, 0.32, 1] as const,
  // Snappy interactions - responsive, modern
  snappy: [0.17, 0.67, 0.3, 0.96] as const,
  // Bouncy reveals - playful, attention-grabbing
  bounce: [0.34, 1.56, 0.64, 1] as const,
  // Natural settle - organic, calming
  settle: [0.4, 0, 0.2, 1] as const,
  // Sharp out - dramatic exits
  sharpOut: [0.6, 0, 0.4, 1] as const,
}

// Duration tokens for timing consistency
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.4,
  slow: 0.6,
  dramatic: 1.0,
  glacial: 1.5,
}

// Stagger delays for list animations
export const stagger = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.15,
  verySlow: 0.2,
}

// Reusable animation variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.smooth }
  }
}

export const fadeInDown = {
  hidden: { opacity: 0, y: -24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: durations.normal, ease: easings.smooth }
  }
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: durations.normal, ease: easings.smooth }
  }
}

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: durations.fast, ease: easings.snappy }
  }
}

export const slideInLeft = {
  hidden: { opacity: 0, x: -24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.normal, ease: easings.smooth }
  }
}

export const slideInRight = {
  hidden: { opacity: 0, x: 24 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: durations.normal, ease: easings.smooth }
  }
}

// Container variants for staggered children
export const staggerContainer = (staggerDelay = stagger.normal) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    }
  }
})

// Hover effects
export const hoverScale = {
  rest: { scale: 1 },
  hover: {
    scale: 1.02,
    transition: { duration: durations.fast, ease: easings.snappy }
  }
}

export const hoverLift = {
  rest: { y: 0 },
  hover: {
    y: -4,
    transition: { duration: durations.fast, ease: easings.smooth }
  }
}

export const hoverGlow = {
  rest: {
    boxShadow: '0 0 0 rgba(255,255,255,0)'
  },
  hover: {
    boxShadow: '0 0 30px rgba(255,255,255,0.05)',
    transition: { duration: durations.normal }
  }
}

// Tap/press effects
export const tapScale = {
  scale: 0.98,
  transition: { duration: durations.instant }
}

// Image hover effect
export const imageZoom = {
  rest: { scale: 1 },
  hover: {
    scale: 1.1,
    transition: { duration: durations.slow, ease: easings.smooth }
  }
}

// Card content lift on hover
export const contentLift = {
  rest: { y: 0 },
  hover: {
    y: -4,
    transition: { duration: durations.fast, ease: easings.smooth }
  }
}

// Spring configurations for physics-based animations
export const springConfigs = {
  gentle: { damping: 25, stiffness: 150, mass: 0.5 },
  snappy: { damping: 20, stiffness: 300 },
  bouncy: { damping: 10, stiffness: 200 },
  magnetic: { damping: 15, stiffness: 150 },
}

// Page transition variants
export const pageTransition = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: durations.fast, ease: easings.smooth }
  },
  exit: {
    opacity: 0,
    transition: { duration: durations.fast, ease: easings.sharpOut }
  }
}
