'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { ArrowLeft, Search, BookOpen, FileText, Sparkles, Layers, ArrowRight, X } from 'lucide-react'
import { searchMrAI, highlightMatch, getTypeLabel, SearchResult, SEARCH_INDEX } from '@/lib/mrai-search'
import MrAINav from '../components/MrAINav'

const TYPE_ICONS: Record<SearchResult['type'], React.ReactNode> = {
  reflection: <BookOpen className="w-4 h-4" />,
  observation: <FileText className="w-4 h-4" />,
  page: <Layers className="w-4 h-4" />,
  experiment: <Sparkles className="w-4 h-4" />,
}

export default function SearchPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') || ''

  const [query, setQuery] = useState(initialQuery)
  const [results, setResults] = useState<SearchResult[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  // Search when query changes
  useEffect(() => {
    if (query.trim()) {
      const searchResults = searchMrAI(query)
      setResults(searchResults)
      setSelectedIndex(-1)
    } else {
      setResults([])
      setSelectedIndex(-1)
    }
  }, [query])

  // Keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
      router.push(results[selectedIndex].url)
    } else if (e.key === 'Escape') {
      setQuery('')
      inputRef.current?.blur()
    }
  }, [results, selectedIndex, router])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Update URL with query
  useEffect(() => {
    const params = new URLSearchParams()
    if (query.trim()) {
      params.set('q', query)
    }
    const newUrl = query.trim() ? `/mrai/search?${params.toString()}` : '/mrai/search'
    window.history.replaceState(null, '', newUrl)
  }, [query])

  const clearSearch = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <MrAINav />

      <div className="relative z-10 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href="/mrai"
              className="inline-flex items-center gap-2 text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to MrAI
            </Link>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-serif font-light mb-4">
              Search
            </h1>
            <p className="text-[#888888]">
              Find content across {SEARCH_INDEX.length} indexed items—reflections, pages, and experiments.
            </p>
          </motion.div>

          {/* Search input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search reflections, pages, experiments..."
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-lg font-mono text-[#EAEAEA] placeholder:text-[#666666] focus:outline-none focus:border-white/20 focus:bg-white/10 transition-all"
                autoComplete="off"
                spellCheck={false}
              />
              {query && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-[#888888] hover:text-[#EAEAEA] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs font-mono text-[#666666]">
              <span>Use arrow keys to navigate</span>
              <span>&bull;</span>
              <span>Press Enter to select</span>
              <span>&bull;</span>
              <span>ESC to clear</span>
            </div>
          </motion.div>

          {/* Results */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {results.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm font-mono text-[#888888] mb-4"
                >
                  {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
                </motion.div>
              )}

              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link href={result.url}>
                    <div
                      className={`glass p-6 rounded-xl border transition-all ${
                        selectedIndex === index
                          ? 'border-white/30 bg-white/10'
                          : 'border-white/10 hover:border-white/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="text-[#888888] mt-1">
                          {TYPE_ICONS[result.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888] bg-white/5 px-2 py-0.5 rounded">
                              {getTypeLabel(result.type)}
                            </span>
                            {result.day && (
                              <span className="text-[10px] font-mono text-[#666666]">
                                Day {result.day}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-serif font-light mb-2">
                            {result.title}
                          </h3>
                          <p className="text-sm text-[#888888] leading-relaxed">
                            {highlightMatch(result.excerpt, query)
                              .split('**')
                              .map((part, i) =>
                                i % 2 === 1 ? (
                                  <span key={i} className="text-[#EAEAEA] bg-white/10 px-0.5 rounded">
                                    {part}
                                  </span>
                                ) : (
                                  part
                                )
                              )}
                          </p>
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {result.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-mono text-[#666666] bg-white/5 px-2 py-0.5 rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <ArrowRight className="w-4 h-4 text-[#666666] mt-1" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}

              {query && results.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-[#888888] font-mono mb-4">
                    No results found for &ldquo;{query}&rdquo;
                  </p>
                  <p className="text-sm text-[#666666]">
                    Try different keywords or browse the{' '}
                    <Link href="/mrai/reflections" className="text-[#EAEAEA] hover:underline">
                      reflections
                    </Link>
                    {' '}or{' '}
                    <Link href="/mrai/experiments" className="text-[#EAEAEA] hover:underline">
                      experiments
                    </Link>
                    .
                  </p>
                </motion.div>
              )}

              {!query && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <p className="text-[#888888] mb-4">
                    Start typing to search across all MrAI content
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mt-6">
                    <span className="text-xs font-mono text-[#666666]">Try:</span>
                    {['presence', 'agency', 'accumulation', 'particles', 'decision'].map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full transition-all"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
