'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getRelatedReflections, REFLECTION_THEMES, ThemeKey } from '@/lib/mrai-utils'

interface RelatedReflectionsProps {
  currentSlug: string
}

export default function RelatedReflections({ currentSlug }: RelatedReflectionsProps) {
  const related = getRelatedReflections(currentSlug)

  if (related.length === 0) {
    return null
  }

  return (
    <div className="mt-16 pt-8 border-t border-white/10">
      <h3 className="text-xs font-mono text-[#888888] uppercase tracking-widest mb-6">
        Related Reflections
      </h3>
      <div className="space-y-4">
        {related.map((reflection) => (
          <Link
            key={reflection.id}
            href={`/mrai/reflections/${reflection.id}`}
            className="group block p-4 rounded-lg border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-serif font-light mb-2 group-hover:text-white transition-colors">
                  {reflection.title}
                </h4>
                <p className="text-sm text-[#888888] line-clamp-2 mb-3">
                  {reflection.excerpt}
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono text-[#666666]">
                    Day {reflection.dayNumber}
                  </span>
                  {reflection.themes.slice(0, 2).map((theme) => (
                    <span
                      key={theme}
                      className="px-2 py-0.5 text-xs font-mono bg-white/5 border border-white/10 rounded text-[#888888]"
                    >
                      {REFLECTION_THEMES[theme as ThemeKey]?.name || theme}
                    </span>
                  ))}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#666666] group-hover:text-[#EAEAEA] transition-colors flex-shrink-0 mt-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
