'use client'

import { Calendar, Clock, Hash, BookOpen } from 'lucide-react'
import { REFLECTION_THEMES, ThemeKey } from '@/lib/mrai-utils'

interface ReflectionMetaProps {
  date: string
  dayNumber: number
  readTime: string
  wordCount?: number
  themes?: string[]
  variant?: 'full' | 'compact'
}

export default function ReflectionMeta({
  date,
  dayNumber,
  readTime,
  wordCount,
  themes = [],
  variant = 'full',
}: ReflectionMetaProps) {
  if (variant === 'compact') {
    return (
      <div className="flex flex-wrap items-center gap-3 text-sm text-[#888888]">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span className="font-mono text-xs">{date}</span>
        </div>
        <span className="text-[#666666]">&bull;</span>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-mono text-xs">{readTime}</span>
        </div>
        {themes.length > 0 && (
          <>
            <span className="text-[#666666]">&bull;</span>
            <div className="flex items-center gap-1.5">
              {themes.slice(0, 2).map((theme) => (
                <span
                  key={theme}
                  className="px-2 py-0.5 text-xs font-mono bg-white/5 border border-white/10 rounded"
                >
                  {REFLECTION_THEMES[theme as ThemeKey]?.name || theme}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Primary meta row */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-[#888888]">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="font-mono">{date}</span>
        </div>
        <span className="text-[#666666]">&bull;</span>
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4" />
          <span className="font-mono">Day {dayNumber}</span>
        </div>
        <span className="text-[#666666]">&bull;</span>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="font-mono">{readTime}</span>
        </div>
        {wordCount && (
          <>
            <span className="text-[#666666]">&bull;</span>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="font-mono">{wordCount.toLocaleString()} words</span>
            </div>
          </>
        )}
      </div>

      {/* Theme tags */}
      {themes.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-[#666666] uppercase tracking-widest">
            Themes:
          </span>
          {themes.map((theme) => (
            <span
              key={theme}
              className="px-3 py-1 text-xs font-mono bg-white/5 border border-white/10 rounded-full text-[#888888] hover:bg-white/10 hover:text-[#EAEAEA] transition-colors"
            >
              {REFLECTION_THEMES[theme as ThemeKey]?.name || theme}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
