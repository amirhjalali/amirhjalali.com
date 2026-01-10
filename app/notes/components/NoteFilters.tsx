'use client'

import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import type { NoteType, ProcessStatus } from '@/lib/types'

interface NoteFiltersProps {
  onFilterChange: (filters: {
    type?: NoteType
    status?: ProcessStatus
    search?: string
    sortBy?: string
    order?: 'asc' | 'desc'
  }) => void
}

export default function NoteFilters({ onFilterChange }: NoteFiltersProps) {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [type, setType] = useState<NoteType | ''>('')
  const [status, setStatus] = useState<ProcessStatus | ''>('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [order, setOrder] = useState<'asc' | 'desc'>('desc')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  // Emit filter changes - onFilterChange is intentionally not in deps as it's a stable callback
  useEffect(() => {
    onFilterChange({
      type: type || undefined,
      status: status || undefined,
      search: debouncedSearch || undefined,
      sortBy,
      order,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, status, debouncedSearch, sortBy, order])

  const handleClear = () => {
    setSearch('')
    setType('')
    setStatus('')
    setSortBy('createdAt')
    setOrder('desc')
  }

  const hasActiveFilters = search || type || status || sortBy !== 'createdAt' || order !== 'desc'

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888888]" />
        <input
          type="text"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-[#EAEAEA] placeholder:text-[#888888]/50 transition-all font-mono text-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Type Filter */}
        <select
          value={type}
          onChange={(e) => setType(e.target.value as NoteType | '')}
          className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-[#EAEAEA] font-mono text-xs uppercase tracking-widest cursor-pointer"
        >
          <option value="">All Types</option>
          <option value="LINK">Link</option>
          <option value="TEXT">Text</option>
          <option value="IMAGE">Image</option>
          <option value="VIDEO">Video</option>
          <option value="PDF">PDF</option>
          <option value="DOCUMENT">Document</option>
        </select>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as ProcessStatus | '')}
          className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-[#EAEAEA] font-mono text-xs uppercase tracking-widest cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="INDEXED">Indexed</option>
          <option value="COMPLETED">Completed</option>
          <option value="FAILED">Failed</option>
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-[#EAEAEA] font-mono text-xs uppercase tracking-widest cursor-pointer"
        >
          <option value="createdAt">Date</option>
          <option value="title">Title</option>
          <option value="type">Type</option>
        </select>

        {/* Order */}
        <select
          value={order}
          onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
          className="px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-[#EAEAEA] font-mono text-xs uppercase tracking-widest cursor-pointer"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/20 rounded-xl text-[#EAEAEA] hover:bg-white/10 transition-all font-mono text-xs uppercase tracking-widest"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  )
}
