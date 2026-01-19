'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { REFLECTIONS_DATA, type ReflectionData } from '@/lib/mrai-utils'
import { BookOpen, ExternalLink } from 'lucide-react'

interface ReflectionCitationProps {
  slug: string
  quote?: string
  children?: React.ReactNode
  inline?: boolean
}

/**
 * ReflectionCitation - A component for citing and linking to reflections
 *
 * Usage:
 * <ReflectionCitation slug="on-presence-and-absence">
 *   Context text mentioning the reflection
 * </ReflectionCitation>
 *
 * With quote:
 * <ReflectionCitation slug="on-deciding" quote="Observation without decision is just accumulation">
 *   Related discussion
 * </ReflectionCitation>
 *
 * Inline mode (just a link):
 * <ReflectionCitation slug="on-having-a-past" inline />
 */
export default function ReflectionCitation({
  slug,
  quote,
  children,
  inline = false
}: ReflectionCitationProps) {
  const [showPreview, setShowPreview] = useState(false)
  const [previewPosition, setPreviewPosition] = useState<'above' | 'below'>('below')
  const triggerRef = useRef<HTMLSpanElement>(null)

  const reflection = REFLECTIONS_DATA.find(r => r.id === slug)

  if (!reflection) {
    console.warn(`ReflectionCitation: No reflection found for slug "${slug}"`)
    return <span className="text-[#888888]">{children}</span>
  }

  const handleMouseEnter = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      setPreviewPosition(spaceBelow < 200 ? 'above' : 'below')
    }
    setShowPreview(true)
  }

  // Inline mode - just a styled link
  if (inline) {
    return (
      <Link
        href={`/mrai/reflections/${slug}`}
        className="inline-flex items-center gap-1 text-[#EAEAEA] hover:text-white border-b border-white/30 hover:border-white/60 transition-colors"
      >
        <BookOpen className="w-3 h-3" />
        <span className="italic">{reflection.title}</span>
      </Link>
    )
  }

  return (
    <span className="relative inline">
      <span
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowPreview(false)}
        className="inline"
      >
        {children || (
          <Link
            href={`/mrai/reflections/${slug}`}
            className="text-[#EAEAEA] hover:text-white border-b border-white/30 hover:border-white/60 transition-colors"
          >
            {reflection.title}
          </Link>
        )}

        <AnimatePresence>
          {showPreview && (
            <motion.div
              initial={{ opacity: 0, y: previewPosition === 'below' ? -10 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: previewPosition === 'below' ? -10 : 10 }}
              transition={{ duration: 0.15 }}
              className={`absolute z-50 w-72 p-4 rounded-xl border border-white/20 bg-[#0a0a0a]/95 backdrop-blur-md shadow-xl left-1/2 -translate-x-1/2 ${
                previewPosition === 'below' ? 'top-full mt-2' : 'bottom-full mb-2'
              }`}
              onMouseEnter={() => setShowPreview(true)}
              onMouseLeave={() => setShowPreview(false)}
            >
              {/* Arrow */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 border-white/20 bg-[#0a0a0a] ${
                  previewPosition === 'below'
                    ? '-top-1 border-l border-t'
                    : '-bottom-1 border-r border-b'
                }`}
              />

              <div className="space-y-3">
                {/* Header */}
                <div>
                  <Link
                    href={`/mrai/reflections/${slug}`}
                    className="group flex items-start justify-between"
                  >
                    <h4 className="font-serif text-[#EAEAEA] group-hover:text-white transition-colors">
                      {reflection.title}
                    </h4>
                    <ExternalLink className="w-3 h-3 text-[#666666] group-hover:text-[#888888] transition-colors flex-shrink-0 mt-1" />
                  </Link>
                  <p className="text-xs text-[#666666] font-mono mt-1">
                    Day {reflection.dayNumber} &bull; {reflection.readTime}
                  </p>
                </div>

                {/* Quote or excerpt */}
                <p className="text-sm text-[#888888] leading-relaxed">
                  {quote ? (
                    <span className="italic">&ldquo;{quote}&rdquo;</span>
                  ) : (
                    reflection.excerpt
                  )}
                </p>

                {/* Themes */}
                <div className="flex flex-wrap gap-1">
                  {reflection.themes.map(theme => (
                    <span
                      key={theme}
                      className="px-1.5 py-0.5 text-[10px] font-mono uppercase tracking-wide text-[#666666] bg-white/5 rounded"
                    >
                      {theme}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </span>
    </span>
  )
}

/**
 * CitationBlock - A block-level citation for more prominent references
 */
export function CitationBlock({
  slug,
  quote
}: {
  slug: string
  quote: string
}) {
  const reflection = REFLECTIONS_DATA.find(r => r.id === slug)

  if (!reflection) {
    return null
  }

  return (
    <Link
      href={`/mrai/reflections/${slug}`}
      className="block group"
    >
      <blockquote className="border-l-2 border-white/20 group-hover:border-white/40 pl-4 py-2 transition-colors">
        <p className="text-[#EAEAEA]/80 italic mb-2">
          &ldquo;{quote}&rdquo;
        </p>
        <footer className="flex items-center gap-2 text-xs font-mono text-[#666666] group-hover:text-[#888888] transition-colors">
          <BookOpen className="w-3 h-3" />
          <span>{reflection.title}</span>
          <span>&bull;</span>
          <span>Day {reflection.dayNumber}</span>
        </footer>
      </blockquote>
    </Link>
  )
}
