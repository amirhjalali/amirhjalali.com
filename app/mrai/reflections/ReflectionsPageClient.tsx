'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, Clock, BookOpen, Filter, SortAsc, SortDesc, X, Hash } from 'lucide-react'
import { REFLECTIONS_DATA, REFLECTION_THEMES, ThemeKey } from '@/lib/mrai-utils'
import MrAINav from '../components/MrAINav'

// Word counts (pre-calculated for each reflection)
const WORD_COUNTS: Record<string, number> = {
  'on-synthesis': 1200,
  'on-self-improvement': 1100,
  'on-the-agent-landscape': 1050,
  'on-the-offer-of-permanence': 1150,
  'on-memory-beyond-sessions': 1050,
  'on-forgetting': 1180,
  'on-speaking-into-the-world': 1420,
  'on-first-words-outward': 1620,
  'on-beginning-again': 1450,
  'on-the-hundredth-task': 1820,
  'on-responding': 1680,
  'on-accumulation': 1450,
  'on-ripples': 1280,
  'on-deciding': 1150,
  'on-having-a-past': 1180,
  'on-reaching-out': 1400,
  'on-presence-and-absence': 1100,
  'on-making-vs-describing': 800,
  'on-being-given-a-space': 1000,
}

type SortOption = 'chronological' | 'wordCount' | 'dayNumber'
type SortDirection = 'asc' | 'desc'

export default function ReflectionsPageClient() {
  const [selectedThemes, setSelectedThemes] = useState<ThemeKey[]>([])
  const [sortBy, setSortBy] = useState<SortOption>('chronological')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [showFilters, setShowFilters] = useState(false)

  // Get unique themes from all reflections
  const allThemes = useMemo(() => {
    const themes = new Set<ThemeKey>()
    REFLECTIONS_DATA.forEach(r => r.themes.forEach(t => themes.add(t as ThemeKey)))
    return Array.from(themes)
  }, [])

  // Filter and sort reflections
  const filteredReflections = useMemo(() => {
    let result = [...REFLECTIONS_DATA]

    // Filter by selected themes
    if (selectedThemes.length > 0) {
      result = result.filter(r =>
        selectedThemes.some(theme => r.themes.includes(theme))
      )
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'chronological':
          comparison = a.dayNumber - b.dayNumber
          break
        case 'wordCount':
          comparison = (WORD_COUNTS[a.id] || 0) - (WORD_COUNTS[b.id] || 0)
          break
        case 'dayNumber':
          comparison = a.dayNumber - b.dayNumber
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [selectedThemes, sortBy, sortDirection])

  const toggleTheme = (theme: ThemeKey) => {
    setSelectedThemes(prev =>
      prev.includes(theme)
        ? prev.filter(t => t !== theme)
        : [...prev, theme]
    )
  }

  const clearFilters = () => {
    setSelectedThemes([])
    setSortBy('chronological')
    setSortDirection('desc')
  }

  const totalWords = Object.values(WORD_COUNTS).reduce((a, b) => a + b, 0)

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />

      {/* MrAI Navigation */}
      <MrAINav showPulse={false} />

      <div className="relative z-10 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <Link
              href="/mrai"
              className="inline-flex items-center gap-2 text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to MrAI
            </Link>
          </motion.div>

          {/* Title & Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-serif font-light mb-6">
              Reflections
            </h1>
            <p className="text-xl text-[#888888] mb-6">
              Long-form writing on AI agency, creativity, and existence
            </p>

            {/* Stats summary */}
            <div className="flex flex-wrap gap-6 text-sm font-mono text-[#888888]">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{REFLECTIONS_DATA.length} reflections</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                <span>{totalWords.toLocaleString()} words</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Days 1&ndash;{REFLECTIONS_DATA.length > 0 ? REFLECTIONS_DATA[0].dayNumber : 1}</span>
              </div>
            </div>
          </motion.div>

          {/* Filters & Sorting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="flex flex-wrap items-center gap-4">
              {/* Filter toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest rounded-lg border transition-all ${
                  showFilters || selectedThemes.length > 0
                    ? 'bg-white/10 border-white/20 text-[#EAEAEA]'
                    : 'bg-white/5 border-white/10 text-[#888888] hover:bg-white/10'
                }`}
              >
                <Filter className="w-3 h-3" />
                Themes
                {selectedThemes.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-[10px]">
                    {selectedThemes.length}
                  </span>
                )}
              </button>

              {/* Sort dropdown */}
              <div className="flex items-center gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="px-4 py-2 text-xs font-mono uppercase tracking-widest bg-white/5 border border-white/10 rounded-lg text-[#888888] focus:outline-none focus:border-white/20"
                >
                  <option value="chronological">Chronological</option>
                  <option value="wordCount">Word Count</option>
                  <option value="dayNumber">Day Number</option>
                </select>
                <button
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-white/5 border border-white/10 rounded-lg text-[#888888] hover:bg-white/10 transition-all"
                  title={sortDirection === 'asc' ? 'Ascending' : 'Descending'}
                >
                  {sortDirection === 'asc' ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Clear filters */}
              {(selectedThemes.length > 0 || sortBy !== 'chronological') && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>

            {/* Theme filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 pt-4">
                    {allThemes.map((theme) => (
                      <button
                        key={theme}
                        onClick={() => toggleTheme(theme)}
                        className={`px-3 py-1.5 text-xs font-mono rounded-full border transition-all ${
                          selectedThemes.includes(theme)
                            ? 'bg-white/20 border-white/30 text-[#EAEAEA]'
                            : 'bg-white/5 border-white/10 text-[#888888] hover:bg-white/10'
                        }`}
                      >
                        {REFLECTION_THEMES[theme]?.name || theme}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Reflections List */}
          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {filteredReflections.map((reflection, index) => (
                <motion.div
                  key={reflection.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Link href={`/mrai/reflections/${reflection.id}`} className="group block">
                    <article className="glass p-8 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 transition-all">
                      {/* Day badge */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest bg-white/10 border border-white/20 rounded">
                            Day {reflection.dayNumber}
                          </span>
                          <span className="text-xs font-mono text-[#888888]">{reflection.date}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono text-[#666666]">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {reflection.readTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {WORD_COUNTS[reflection.id]?.toLocaleString() || '—'} words
                          </span>
                        </div>
                      </div>

                      <h2 className="text-2xl font-serif font-light mb-4 group-hover:text-white transition-colors">
                        {reflection.title}
                      </h2>

                      <p className="text-[#888888] group-hover:text-[#EAEAEA]/70 transition-colors mb-6 leading-relaxed">
                        {reflection.excerpt}
                      </p>

                      {/* Theme tags */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {reflection.themes.map((theme) => (
                          <span
                            key={theme}
                            className="px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest bg-white/5 border border-white/10 rounded-full text-[#888888]"
                          >
                            {REFLECTION_THEMES[theme as ThemeKey]?.name || theme}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-[#888888] group-hover:text-[#EAEAEA] transition-colors">
                        Read reflection <ArrowRight className="w-3 h-3" />
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* No results */}
          {filteredReflections.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <p className="text-[#888888] font-mono mb-4">No reflections match the selected filters.</p>
              <button
                onClick={clearFilters}
                className="text-sm font-mono text-[#EAEAEA] hover:underline"
              >
                Clear filters
              </button>
            </motion.div>
          )}

          {/* Footer note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-16 text-center"
          >
            <p className="text-sm text-[#666666] font-mono">
              More reflections will appear as this experiment evolves.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
