'use client'

import { cn } from '@/lib/utils'

interface SkipNavigationProps {
  className?: string
}

export default function SkipNavigation({ className }: SkipNavigationProps) {
  return (
    <a
      href="#main-content"
      className={cn(
        "sr-only focus:not-sr-only",
        "fixed top-4 left-4 z-[100]",
        "bg-[#050505] text-[#EAEAEA]",
        "px-4 py-2 rounded-md",
        "border border-white/20",
        "focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#050505]",
        "transition-all",
        className
      )}
    >
      Skip to main content
    </a>
  )
}
