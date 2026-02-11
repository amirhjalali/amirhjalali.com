'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { apiClient } from '@/lib/api-client'
import type { Note, NoteType, ProcessStatus } from '@/lib/types'
import NoteCard from './NoteCard'
import NoteFilters from './NoteFilters'
import { Loader2 } from 'lucide-react'

interface NotesListProps {
  refreshKey?: number
  viewMode?: 'grid' | 'list'
}

export default function NotesList({ refreshKey, viewMode: externalViewMode }: NotesListProps) {
  const isMounted = useRef(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [internalViewMode, setInternalViewMode] = useState<'grid' | 'list'>('grid')

  // Use external viewMode if provided, otherwise use internal state
  const viewMode = externalViewMode ?? internalViewMode
  const _setViewMode = externalViewMode ? () => {} : setInternalViewMode
  const [filters, setFilters] = useState<{
    type?: NoteType
    status?: ProcessStatus
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
  // Unified fetch effect handles both initial load and updates
  useEffect(() => {
    const showLoading = !isMounted.current
    fetchNotes(showLoading)
    isMounted.current = true
  }, [filters, page, fetchNotes])

  // Refresh when a new note is added
  useEffect(() => {
    if (refreshKey && refreshKey > 0) {
      fetchNotes(false)
    }
  }, [refreshKey, fetchNotes])

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    // Show loading state when filters change (not just refresh spinner)
    setIsLoading(true)
    setFilters(newFilters)
    setPage(0)
  }, [])

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
      {/* Filters */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <NoteFilters onFilterChange={handleFilterChange} />
        </div>
        {isRefreshing && (
          <div>
            <Loader2 className="w-4 h-4 text-[#888888] animate-spin" />
          </div>
        )}
      </div>

      {/* Notes Grid/List */}
      <div className="min-h-[400px]">
        {notes.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <p className="text-[#888888] font-mono text-sm">
              No notes found. Create your first note above!
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'space-y-4'
            }
          >
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
              >
                <NoteCard note={note} onDelete={fetchNotes} compact={viewMode === 'list'} />
              </motion.div>
            ))}
          </div>
        )}
      </div>

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
