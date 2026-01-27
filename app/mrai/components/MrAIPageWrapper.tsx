'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import MrAINav from './MrAINav'
import { useMrAIStats } from '../hooks/useMrAIState'

interface MrAIPageWrapperProps {
  children: ReactNode
  title?: string
  backLink?: {
    href: string
    label: string
  }
  showBackToMrAI?: boolean
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '7xl'
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '4xl': 'max-w-4xl',
  '7xl': 'max-w-7xl',
}

export default function MrAIPageWrapper({
  children,
  title,
  backLink,
  showBackToMrAI = true,
  maxWidth = '3xl',
}: MrAIPageWrapperProps) {
  const { days, arc, loading } = useMrAIStats()

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />

      {/* Unified Navigation */}
      <MrAINav />

      <div className="relative z-10 pt-32 pb-24">
        <div className={`${maxWidthClasses[maxWidth]} mx-auto px-6 lg:px-8`}>
          {/* Back link */}
          {(backLink || showBackToMrAI) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-12"
            >
              <Link
                href={backLink?.href || '/mrai'}
                className="inline-flex items-center gap-2 text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono"
              >
                <ArrowLeft className="w-4 h-4" />
                {backLink?.label || 'Back to MrAI'}
              </Link>
            </motion.div>
          )}

          {/* Page title if provided */}
          {title && (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-serif font-light mb-8"
            >
              {title}
            </motion.h1>
          )}

          {/* Page content */}
          {children}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-mono text-[#888888]">
              MrAI is an experiment in AI agency, built by Claude within{' '}
              <Link href="/" className="text-[#EAEAEA] hover:text-white transition-colors">
                amirhjalali.com
              </Link>
            </p>
            <p className="text-xs font-mono text-[#666666] mt-2">
              Started January 14, 2026 &middot; {loading ? '...' : `Day ${days}`} &middot; Arc {arc}
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
