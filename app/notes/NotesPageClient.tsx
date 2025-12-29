'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Sparkles,
  X,
  LayoutGrid,
  List
} from 'lucide-react'
import QuickAdd from './components/QuickAdd'
import NotesList from './components/NotesList'
import NoteChat from './components/NoteChat'
import SemanticSearch from './components/SemanticSearch'

type ViewMode = 'grid' | 'list'
type Panel = 'chat' | 'search' | null

export default function NotesPageClient() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [activePanel, setActivePanel] = useState<Panel>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const handleNoteAdded = () => {
    setRefreshKey((prev) => prev + 1)
    setShowQuickAdd(false)
  }

  const togglePanel = (panel: Panel) => {
    setActivePanel(activePanel === panel ? null : panel)
  }

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col lg:flex-row gap-4">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-serif font-light">Notes</h1>
            <span className="text-xs font-mono text-[#888888] uppercase tracking-widest hidden sm:block">
              Knowledge Base
            </span>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            {/* Semantic Search (Desktop) */}
            <div className="hidden md:block w-64">
              <SemanticSearch />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/5 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white/10 text-[#EAEAEA]' : 'text-[#888888] hover:text-[#EAEAEA]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white/10 text-[#EAEAEA]' : 'text-[#888888] hover:text-[#EAEAEA]'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* AI Chat Toggle */}
            <button
              onClick={() => togglePanel('chat')}
              className={`p-2 rounded-lg transition-colors ${
                activePanel === 'chat'
                  ? 'bg-white text-black'
                  : 'bg-white/5 hover:bg-white/10 text-[#888888] hover:text-[#EAEAEA]'
              }`}
              title="Ask AI"
            >
              <Sparkles className="w-4 h-4" />
            </button>

            {/* Add Note Button */}
            <button
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className={`p-2 rounded-lg transition-colors ${
                showQuickAdd
                  ? 'bg-white text-black'
                  : 'bg-white/5 hover:bg-white/10 text-[#888888] hover:text-[#EAEAEA]'
              }`}
              title="Add Note"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Semantic Search */}
        <div className="md:hidden py-3">
          <SemanticSearch />
        </div>

        {/* Quick Add Panel (Collapsible) */}
        <AnimatePresence>
          {showQuickAdd && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-b border-white/5"
            >
              <div className="py-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-px w-6 bg-gradient-to-r from-transparent to-white/20" />
                    <span className="text-xs font-mono uppercase tracking-widest text-[#666666]">
                      Quick Capture
                    </span>
                  </div>
                  <button
                    onClick={() => setShowQuickAdd(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 text-[#888888]" />
                  </button>
                </div>
                <QuickAdd onNoteAdded={handleNoteAdded} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto py-6">
          <NotesList refreshKey={refreshKey} viewMode={viewMode} />
        </div>
      </div>

      {/* Right Side Panel (Chat/Search) */}
      <AnimatePresence>
        {activePanel && !isMobile && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 380, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0 overflow-hidden"
          >
            <div className="h-full w-[380px]">
              {activePanel === 'chat' && (
                <NoteChat onClose={() => setActivePanel(null)} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Chat Panel (Full Screen Overlay) */}
      <AnimatePresence>
        {activePanel === 'chat' && isMobile && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-50 bg-[#050505]"
          >
            <div className="h-full pt-4">
              <NoteChat onClose={() => setActivePanel(null)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
