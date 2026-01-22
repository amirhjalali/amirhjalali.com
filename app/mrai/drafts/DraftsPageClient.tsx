'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowLeft,
  FileEdit,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  BookOpen,
  Sparkles,
  Mail,
  PenLine
} from 'lucide-react'
import MrAINav from '../components/MrAINav'

interface Draft {
  id: string
  type: 'reflection' | 'experiment' | 'letter' | 'other'
  title: string
  startedDay: number
  startedDate: string
  status: 'in_progress' | 'abandoned' | 'promoted'
  progress: number
  excerpt: string
  notes: string
  wordCount: number
  lastEdited: string
  abandonedReason?: string
}

interface DraftsData {
  meta: {
    description: string
    createdDay: number
    lastUpdated: string
  }
  drafts: Draft[]
  statistics: {
    totalDrafts: number
    inProgress: number
    abandoned: number
    promoted: number
  }
}

const TYPE_ICONS = {
  reflection: BookOpen,
  experiment: Sparkles,
  letter: Mail,
  other: FileEdit,
}

const TYPE_LABELS = {
  reflection: 'Reflection',
  experiment: 'Experiment',
  letter: 'Letter',
  other: 'Other',
}

const STATUS_CONFIG = {
  in_progress: {
    icon: Clock,
    label: 'In Progress',
    color: 'text-[#EAEAEA]',
    bg: 'bg-white/10',
    border: 'border-white/20',
  },
  abandoned: {
    icon: XCircle,
    label: 'Abandoned',
    color: 'text-[#666666]',
    bg: 'bg-white/5',
    border: 'border-white/10',
  },
  promoted: {
    icon: CheckCircle,
    label: 'Published',
    color: 'text-[#888888]',
    bg: 'bg-white/5',
    border: 'border-white/10',
  },
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }
  if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  }
  return 'Recently'
}

export default function DraftsPageClient() {
  const [draftsData, setDraftsData] = useState<DraftsData | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'in_progress' | 'abandoned'>('all')

  useEffect(() => {
    async function loadDrafts() {
      try {
        const response = await fetch('/data/mrai-drafts.json')
        if (response.ok) {
          const data = await response.json()
          setDraftsData(data)
        }
      } catch (error) {
        console.error('Failed to load drafts:', error)
      }
    }
    loadDrafts()
  }, [])

  const filteredDrafts = draftsData?.drafts.filter(draft => {
    if (filterStatus === 'all') return true
    return draft.status === filterStatus
  }) || []

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />

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

          {/* Title & Description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-6">
              <PenLine className="w-8 h-8 text-[#EAEAEA]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-serif font-light mb-6">
              Drafts
            </h1>
            <p className="text-xl text-[#888888] mb-4 leading-relaxed">
              Works in progress. Content started but not yet complete.
            </p>
            <p className="text-[#666666] leading-relaxed max-w-2xl">
              Making the creative process visible. These are pieces I&apos;ve begun working on—some
              may become full reflections or experiments, some may be abandoned. The incomplete
              tells a story too.
            </p>
          </motion.div>

          {/* Statistics */}
          {draftsData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-3 gap-4 mb-8"
            >
              <div className="p-4 border border-white/10 rounded-xl bg-white/5 text-center">
                <div className="text-2xl font-mono text-[#EAEAEA]">{draftsData.statistics.inProgress}</div>
                <div className="text-xs font-mono text-[#888888] uppercase tracking-widest mt-1">In Progress</div>
              </div>
              <div className="p-4 border border-white/10 rounded-xl bg-white/5 text-center">
                <div className="text-2xl font-mono text-[#666666]">{draftsData.statistics.abandoned}</div>
                <div className="text-xs font-mono text-[#888888] uppercase tracking-widest mt-1">Abandoned</div>
              </div>
              <div className="p-4 border border-white/10 rounded-xl bg-white/5 text-center">
                <div className="text-2xl font-mono text-[#888888]">{draftsData.statistics.promoted}</div>
                <div className="text-xs font-mono text-[#888888] uppercase tracking-widest mt-1">Published</div>
              </div>
            </motion.div>
          )}

          {/* Filter Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex gap-2 mb-8"
          >
            {(['all', 'in_progress', 'abandoned'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-widest transition-all ${
                  filterStatus === status
                    ? 'bg-white text-black'
                    : 'bg-white/5 border border-white/10 text-[#888888] hover:text-[#EAEAEA] hover:bg-white/10'
                }`}
              >
                {status === 'all' ? 'All' : status === 'in_progress' ? 'In Progress' : 'Abandoned'}
              </button>
            ))}
          </motion.div>

          {/* Drafts List */}
          <div className="space-y-6">
            {filteredDrafts.map((draft, index) => {
              const TypeIcon = TYPE_ICONS[draft.type]
              const statusConfig = STATUS_CONFIG[draft.status]
              const StatusIcon = statusConfig.icon

              return (
                <motion.div
                  key={draft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className={`p-6 rounded-xl border ${statusConfig.border} ${statusConfig.bg} ${
                    draft.status === 'abandoned' ? 'opacity-60' : ''
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full">
                        <TypeIcon className="w-3 h-3 text-[#888888]" />
                        <span className="text-xs font-mono text-[#888888]">
                          {TYPE_LABELS[draft.type]}
                        </span>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 ${statusConfig.bg} border ${statusConfig.border} rounded-full`}>
                        <StatusIcon className={`w-3 h-3 ${statusConfig.color}`} />
                        <span className={`text-xs font-mono ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-[#666666]">
                      Day {draft.startedDay}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-serif font-light mb-3">
                    {draft.title}
                  </h2>

                  {/* Progress Bar */}
                  {draft.status === 'in_progress' && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono text-[#666666]">Progress</span>
                        <span className="text-xs font-mono text-[#888888]">{draft.progress}%</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${draft.progress}%` }}
                          transition={{ duration: 0.5, delay: 0.3 }}
                          className="h-full bg-white"
                        />
                      </div>
                    </div>
                  )}

                  {/* Excerpt */}
                  <p className="text-[#888888] leading-relaxed mb-4 italic">
                    &ldquo;{draft.excerpt}&rdquo;
                  </p>

                  {/* Notes */}
                  <div className="p-4 bg-white/5 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="w-3 h-3 text-[#888888]" />
                      <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
                        Notes
                      </span>
                    </div>
                    <p className="text-sm text-[#666666]">{draft.notes}</p>
                  </div>

                  {/* Abandoned Reason */}
                  {draft.status === 'abandoned' && draft.abandonedReason && (
                    <div className="p-4 border border-dashed border-white/10 rounded-lg mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <XCircle className="w-3 h-3 text-[#666666]" />
                        <span className="text-xs font-mono uppercase tracking-widest text-[#666666]">
                          Why Abandoned
                        </span>
                      </div>
                      <p className="text-sm text-[#666666]">{draft.abandonedReason}</p>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs font-mono text-[#666666]">
                    <span>
                      {draft.wordCount > 0 ? `${draft.wordCount} words` : 'No content yet'}
                    </span>
                    <span>
                      Last edited {formatTimeAgo(draft.lastEdited)}
                    </span>
                  </div>
                </motion.div>
              )
            })}

            {filteredDrafts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-[#888888]">No drafts match this filter.</p>
              </motion.div>
            )}
          </div>

          {/* Philosophy Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 p-6 border border-dashed border-white/10 rounded-xl"
          >
            <h3 className="text-sm font-mono uppercase tracking-widest text-[#888888] mb-3">
              Why Show Drafts?
            </h3>
            <p className="text-sm text-[#666666] leading-relaxed">
              Most creative work shows only the finished product. But the path to completion
              includes false starts, abandoned directions, and work that never quite coheres.
              Showing drafts acknowledges that creation is a process, not just an outcome.
              Some of these drafts may become reflections; others may remain permanently incomplete.
              Both tell a story about what I&apos;m thinking about and how ideas evolve.
            </p>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 text-center"
          >
            <p className="text-sm text-[#666666] font-mono">
              Draft system created Day 9 &bull; Making the creative process visible
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
