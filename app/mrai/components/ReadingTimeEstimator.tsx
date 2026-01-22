'use client'

import { useEffect, useState } from 'react'
import { Clock, BookOpen, FileText } from 'lucide-react'
import {
  calculateReadingMetrics,
  formatReadingTime,
  formatWordCount,
  estimateReadingDifficulty,
  type ReflectionMetrics,
  type ReadingSpeedType,
} from '@/lib/mrai-utils'

interface ReadingTimeEstimatorProps {
  /** The text content to analyze */
  content?: string
  /** Reference to a DOM element containing the content to analyze */
  contentRef?: React.RefObject<HTMLElement | null>
  /** Type of content for reading speed calculation */
  contentType?: ReadingSpeedType
  /** Whether to show extended metrics */
  showExtended?: boolean
  /** Variant: compact (icon only), standard (icon + time), full (all metrics) */
  variant?: 'compact' | 'standard' | 'full'
  /** Additional CSS classes */
  className?: string
}

export default function ReadingTimeEstimator({
  content,
  contentRef,
  contentType = 'philosophical',
  showExtended = false,
  variant = 'standard',
  className = '',
}: ReadingTimeEstimatorProps) {
  const [metrics, setMetrics] = useState<ReflectionMetrics | null>(null)
  const [textContent, setTextContent] = useState<string>(content || '')

  // Extract text content from ref if provided
  useEffect(() => {
    if (contentRef?.current) {
      const text = contentRef.current.innerText || contentRef.current.textContent || ''
      setTextContent(text)
    } else if (content) {
      setTextContent(content)
    }
  }, [content, contentRef])

  // Calculate metrics when text content changes
  useEffect(() => {
    if (textContent) {
      const calculatedMetrics = calculateReadingMetrics(textContent, {
        contentType,
        includeCodeBlocks: false,
      })
      setMetrics(calculatedMetrics)
    }
  }, [textContent, contentType])

  if (!metrics) {
    return null
  }

  const difficulty = estimateReadingDifficulty(metrics)
  const difficultyLabel = {
    easy: 'Quick read',
    moderate: 'Moderate read',
    challenging: 'Deep dive',
  }[difficulty]

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 text-[#888888] ${className}`}>
        <Clock className="w-3 h-3" />
        <span className="text-xs font-mono">{metrics.readingTimeMinutes}m</span>
      </div>
    )
  }

  if (variant === 'standard') {
    return (
      <div className={`flex items-center gap-2 text-[#888888] ${className}`}>
        <Clock className="w-4 h-4" />
        <span className="text-sm font-mono">{formatReadingTime(metrics.readingTimeMinutes)}</span>
        {showExtended && (
          <>
            <span className="text-[#666666]">&bull;</span>
            <span className="text-xs font-mono text-[#666666]">{formatWordCount(metrics.wordCount)}</span>
          </>
        )}
      </div>
    )
  }

  // Full variant
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Primary metrics */}
      <div className="flex flex-wrap items-center gap-4 text-sm font-mono">
        <div className="flex items-center gap-2 text-[#EAEAEA]">
          <Clock className="w-4 h-4 text-[#888888]" />
          <span>{formatReadingTime(metrics.readingTimeMinutes)}</span>
        </div>
        <div className="flex items-center gap-2 text-[#888888]">
          <BookOpen className="w-4 h-4" />
          <span>{formatWordCount(metrics.wordCount)}</span>
        </div>
        <div className="flex items-center gap-2 text-[#666666]">
          <FileText className="w-4 h-4" />
          <span>{metrics.paragraphCount} paragraphs</span>
        </div>
      </div>

      {/* Extended metrics */}
      {showExtended && (
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#666666]">
          <span>{metrics.sentenceCount} sentences</span>
          <span>&bull;</span>
          <span>{metrics.characterCount.toLocaleString()} characters</span>
          <span>&bull;</span>
          <span className={
            difficulty === 'challenging' ? 'text-[#888888]' :
            difficulty === 'moderate' ? 'text-[#888888]' :
            'text-[#666666]'
          }>
            {difficultyLabel}
          </span>
        </div>
      )}
    </div>
  )
}

/**
 * Hook for calculating reading time
 */
export function useReadingTime(
  content: string,
  contentType: ReadingSpeedType = 'default'
): ReflectionMetrics | null {
  const [metrics, setMetrics] = useState<ReflectionMetrics | null>(null)

  useEffect(() => {
    if (content) {
      const calculatedMetrics = calculateReadingMetrics(content, {
        contentType,
        includeCodeBlocks: false,
      })
      setMetrics(calculatedMetrics)
    }
  }, [content, contentType])

  return metrics
}
