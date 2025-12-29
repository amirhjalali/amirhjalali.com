'use client'

import { useState, useRef, useCallback } from 'react'
import { Search, Loader2, X, Sparkles, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import type { SearchResult, Note } from '@/lib/types'
import debounce from 'lodash/debounce'

interface SemanticSearchProps {
  notebookId?: string
  onResultClick?: (noteId: string) => void
}

export default function SemanticSearch({ notebookId, onResultClick }: SemanticSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setResults([])
      return
    }

    setIsSearching(true)

    try {
      const response = await fetch('/api/notes/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          query: searchQuery,
          notebookId,
          limit: 10,
          threshold: 0.4,
        }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      setResults(data.results || [])
    } catch (error) {
      console.error('Search error:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((q: string) => performSearch(q), 300),
    [notebookId]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    debouncedSearch(value)
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    inputRef.current?.focus()
  }

  const handleResultClick = (noteId: string) => {
    onResultClick?.(noteId)
    setIsOpen(false)
  }

  const handleFocus = () => {
    setIsOpen(true)
  }

  const handleBlur = () => {
    // Delay to allow click on results
    setTimeout(() => setIsOpen(false), 200)
  }

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isSearching ? (
            <Loader2 className="w-4 h-4 text-[#888888] animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 text-[#888888]" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Semantic search..."
          className="w-full pl-11 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/20 transition-colors text-sm placeholder:text-[#888888]"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center"
          >
            <X className="w-4 h-4 text-[#888888] hover:text-[#EAEAEA]" />
          </button>
        )}
      </div>

      {/* Results Dropdown */}
      <AnimatePresence>
        {isOpen && (query.length >= 3 || results.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50 max-h-[400px] overflow-y-auto"
          >
            {results.length === 0 ? (
              <div className="p-4 text-center">
                {isSearching ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-[#888888]">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </div>
                ) : query.length >= 3 ? (
                  <p className="text-sm text-[#888888]">No results found</p>
                ) : (
                  <p className="text-sm text-[#888888]">Type at least 3 characters to search</p>
                )}
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {results.map((result, index) => (
                  <Link
                    key={`${result.noteId}-${index}`}
                    href={`/notes/${result.noteId}`}
                    onClick={() => handleResultClick(result.noteId)}
                    className="block p-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium truncate">
                            {result.noteTitle || 'Untitled'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-white/10 rounded text-[#888888]">
                            {Math.round(result.score * 100)}% match
                          </span>
                        </div>
                        <p className="text-xs text-[#888888] line-clamp-2">
                          {result.content.substring(0, 150)}...
                        </p>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-[#888888] flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {results.length > 0 && (
              <div className="p-2 border-t border-white/5 bg-white/5">
                <p className="text-[10px] text-[#888888] text-center">
                  {results.length} result{results.length !== 1 ? 's' : ''} found
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
