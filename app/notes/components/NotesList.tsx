'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { apiClient } from '@/lib/api-client'
import type { Note, NoteType } from '@/lib/types'
import NoteCard from './NoteCard'
import NoteFilters from './NoteFilters'
import { Grid3x3, List } from 'lucide-react'

export default function NotesList({ refreshKey }: { refreshKey?: number }) {
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filters, setFilters] = useState<{
    type?: NoteType
    search?: string
    sortBy?: string
    order?: 'asc' | 'desc'
  }>({})
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const fetchNotes = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true)
    } else {
      setIsRefreshing(true)
    }

    try {
      const result = await apiClient.getNotes({
        ...filters,
        limit: 50,
        offset: page * 50,
      })
      setNotes(result.notes)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error('Failed to fetch notes:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [filters, page])

  // Initial load only
  useEffect(() => {
    fetchNotes(true)
  }, []) // Only run on mount

  // Refresh when filters/page change (but don't show full loading state)
  useEffect(() => {
    if (notes.length > 0) {
      // Add small delay to prevent rapid successive calls
      const timer = setTimeout(() => {
        fetchNotes(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [filters, page, notes.length, fetchNotes])

  // Refresh when a new note is added
  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      fetchNotes(false)
    }
  }, [refreshKey, fetchNotes])

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
    setPage(0)
  }

  if (isLoading && notes.length === 0) {
    return (
      <div className="space-y-4 min-h-[400px]">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-32 bg-white/5 border border-white/10 rounded-2xl animate-pulse"
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Refreshing Indicator */}
      {isRefreshing && (
        <div className="text-xs font-mono text-[#888888] text-center py-2">
          Updating...
        </div>
      )}

      {/* View Mode Toggle & Filters */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <NoteFilters onFilterChange={handleFilterChange} />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
              ? 'bg-white/20 text-white'
              : 'bg-black/20 text-[#888888] hover:bg-white/10'
              }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list'
              ? 'bg-white/20 text-white'
              : 'bg-black/20 text-[#888888] hover:bg-white/10'
              }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Notes Grid/List */}
      {notes.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <p className="text-[#888888] font-mono text-sm">
            No notes found. Create your first note above!
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-4'
          }
        >
          <AnimatePresence mode="popLayout">
            {notes.map((note) => (
              <motion.div
                layout
                key={note.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <NoteCard note={note} onDelete={fetchNotes} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Pagination */}
      {(page > 0 || hasMore) && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-6 py-2 bg-black/20 border border-white/10 rounded-xl font-mono text-xs uppercase tracking-widest hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <span className="text-sm text-[#888888] font-mono">
            Page {page + 1}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore}
            className="px-6 py-2 bg-black/20 border border-white/10 rounded-xl font-mono text-xs uppercase tracking-widest hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
