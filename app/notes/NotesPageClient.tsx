'use client'

import { useState } from 'react'
import QuickAdd from './components/QuickAdd'
import NotesList from './components/NotesList'

export default function NotesPageClient() {
  const [refreshKey, setRefreshKey] = useState(0)

  const handleNoteAdded = () => {
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-12">
      {/* Minimal Hero Section */}
      <div className="text-center space-y-3">
        <h1 className="text-5xl md:text-6xl font-serif font-light tracking-tight">
          Notes
        </h1>
        <p className="text-[#888888] font-mono text-xs uppercase tracking-[0.3em]">
          Capture · Organize · Discover
        </p>
      </div>

      {/* QuickAdd Component - More minimal */}
      <div className="border border-white/5 rounded-2xl bg-white/[0.02] backdrop-blur-sm hover:bg-white/[0.04] transition-all duration-300">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/20" />
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-[#666666]">
              Quick Capture
            </h2>
          </div>
          <QuickAdd onNoteAdded={handleNoteAdded} />
        </div>
      </div>

      {/* Notes List Component - More minimal */}
      <div className="border border-white/5 rounded-2xl bg-white/[0.02] backdrop-blur-sm">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-8 bg-gradient-to-r from-transparent to-white/20" />
            <h2 className="text-xs font-mono uppercase tracking-[0.3em] text-[#666666]">
              Collection
            </h2>
          </div>
          <NotesList refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  )
}
