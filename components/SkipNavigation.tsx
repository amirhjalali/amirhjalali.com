'use client'

import { cn } from '@/lib/utils'

interface SkipNavigationProps {
  className?: string
}

export default function SkipNavigation({ className }: SkipNavigationProps) {
  return (
    <>
      <a
        href="#main-content"
        className={cn(
          "sr-only focus:not-sr-only",
          "absolute top-0 left-0 z-[100]",
          "bg-background text-foreground",
          "px-4 py-2 m-2 rounded-md",
          "border-2 border-ai-green",
          "focus:outline-none focus:ring-2 focus:ring-ai-green focus:ring-offset-2",
          "animate-in fade-in slide-in-from-top-2",
          className
        )}
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className={cn(
          "sr-only focus:not-sr-only",
          "absolute top-0 left-32 z-[100]",
          "bg-background text-foreground",
          "px-4 py-2 m-2 rounded-md",
          "border-2 border-ai-green",
          "focus:outline-none focus:ring-2 focus:ring-ai-green focus:ring-offset-2",
          "animate-in fade-in slide-in-from-top-2",
          className
        )}
      >
        Skip to navigation
      </a>
    </>
  )
}