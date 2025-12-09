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
    <div className="space-y-8">
      {/* Page Header */}
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-serif font-light mb-2">
          Your Notes
        </h1>
        <p className="text-[#888888] font-mono text-xs uppercase tracking-widest">
          Quick capture for links, images, videos, and text
        </p>
      </div>

      {/* QuickAdd Component */}
      <div className="glass p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
        <h2 className="text-sm font-mono uppercase tracking-widest text-[#888888] mb-4">
          Quick Add
        </h2>
        <QuickAdd onNoteAdded={handleNoteAdded} />
      </div>

      {/* Notes List Component */}
      <div className="glass p-6 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md">
        <h2 className="text-sm font-mono uppercase tracking-widest text-[#888888] mb-6">
          Your Notes
        </h2>
        <NotesList refreshKey={refreshKey} />
      </div>
    </div>
  )
}
