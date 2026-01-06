'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  X,
  Brain,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  SkipForward,
  RefreshCw,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Loader2,
} from 'lucide-react'

interface ReviewNote {
  id: string
  title: string | null
  excerpt: string | null
  type: string
  reviewCount: number
  lastReviewedAt: string | null
  nextReviewAt: string | null
  daysOverdue: number
}

interface ReviewStats {
  totalNotes: number
  reviewedToday: number
  dueToday: number
  dueThisWeek: number
  overdue: number
  neverReviewed: number
  averageEaseFactor: number
}

interface ReviewQueueProps {
  isOpen: boolean
  onClose: () => void
}

export default function ReviewQueue({ isOpen, onClose }: ReviewQueueProps) {
  const [queue, setQueue] = useState<ReviewNote[]>([])
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isReviewing, setIsReviewing] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Fetch review data
  const fetchReviewData = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/notes/review', {
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setQueue(data.queue || [])
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch review data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchReviewData()
      setCurrentIndex(0)
      setIsReviewing(false)
      setShowAnswer(false)
    }
  }, [isOpen, fetchReviewData])

  // Record review
  const recordReview = async (quality: number) => {
    const currentNote = queue[currentIndex]
    if (!currentNote || submitting) return

    setSubmitting(true)
    try {
      await fetch('/api/notes/review', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: currentNote.id, quality }),
      })

      // Move to next card
      nextCard()
    } catch (error) {
      console.error('Failed to record review:', error)
    } finally {
      setSubmitting(false)
    }
  }

  // Skip note
  const skipNote = async () => {
    const currentNote = queue[currentIndex]
    if (!currentNote || submitting) return

    setSubmitting(true)
    try {
      await fetch('/api/notes/review', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: currentNote.id, action: 'skip', days: 1 }),
      })

      nextCard()
    } catch (error) {
      console.error('Failed to skip:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const nextCard = () => {
    setShowAnswer(false)
    if (currentIndex < queue.length - 1) {
      setCurrentIndex((i) => i + 1)
    } else {
      // End of queue
      setIsReviewing(false)
      fetchReviewData()
    }
  }

  const startReview = () => {
    setIsReviewing(true)
    setCurrentIndex(0)
    setShowAnswer(false)
  }

  if (!isOpen) return null

  const currentNote = queue[currentIndex]

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0a0a0a] rounded-2xl border border-white/10 w-full max-w-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-[#888888]" />
            <h2 className="text-lg font-mono uppercase tracking-widest text-[#888888]">
              Review Queue
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-[#888888]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 text-[#888888] animate-spin" />
            </div>
          ) : isReviewing && currentNote ? (
            // Review Card
            <div className="space-y-6">
              {/* Progress */}
              <div className="flex items-center justify-between text-xs text-[#888888]">
                <span>
                  Card {currentIndex + 1} of {queue.length}
                </span>
                <span>Reviews today: {stats?.reviewedToday || 0}</span>
              </div>

              {/* Card */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/10 min-h-[200px]">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-xs font-mono uppercase text-[#888888]">
                    {currentNote.type}
                  </span>
                  {currentNote.daysOverdue > 0 && (
                    <span className="text-xs text-[#888888] flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {currentNote.daysOverdue} days overdue
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-medium mb-4">
                  {currentNote.title || 'Untitled Note'}
                </h3>

                {!showAnswer ? (
                  <div className="text-center py-8">
                    <HelpCircle className="w-12 h-12 text-[#888888] mx-auto mb-4" />
                    <p className="text-[#888888]">What do you remember about this note?</p>
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="mt-4 px-6 py-2 bg-white text-black rounded-lg hover:bg-[#EAEAEA] transition-colors font-mono text-sm uppercase tracking-widest"
                    >
                      Show Answer
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-[#EAEAEA] mb-4">
                      {currentNote.excerpt || 'No excerpt available'}
                    </p>
                    <Link
                      href={`/notes/${currentNote.id}`}
                      target="_blank"
                      className="text-sm text-[#888888] hover:text-[#EAEAEA] underline"
                    >
                      View full note →
                    </Link>
                  </div>
                )}
              </div>

              {/* Rating Buttons */}
              {showAnswer && (
                <div className="space-y-3">
                  <p className="text-xs text-[#888888] text-center">
                    How well did you remember?
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => recordReview(1)}
                      disabled={submitting}
                      className="flex flex-col items-center gap-1 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      <ThumbsDown className="w-5 h-5 text-[#888888]" />
                      <span className="text-xs text-[#888888]">Forgot</span>
                    </button>
                    <button
                      onClick={() => recordReview(3)}
                      disabled={submitting}
                      className="flex flex-col items-center gap-1 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      <HelpCircle className="w-5 h-5 text-[#888888]" />
                      <span className="text-xs text-[#888888]">Hard</span>
                    </button>
                    <button
                      onClick={() => recordReview(5)}
                      disabled={submitting}
                      className="flex flex-col items-center gap-1 p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                      <ThumbsUp className="w-5 h-5 text-[#888888]" />
                      <span className="text-xs text-[#888888]">Easy</span>
                    </button>
                  </div>
                  <button
                    onClick={skipNote}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 p-2 text-[#888888] hover:text-[#EAEAEA] transition-colors disabled:opacity-50"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <SkipForward className="w-4 h-4" />
                        <span className="text-xs">Skip for now</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Stats Overview
            <div className="space-y-6">
              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-medium">{stats.dueToday}</div>
                    <div className="text-xs text-[#888888]">Due today</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-medium">{stats.overdue}</div>
                    <div className="text-xs text-[#888888]">Overdue</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-medium">{stats.reviewedToday}</div>
                    <div className="text-xs text-[#888888]">Reviewed today</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="text-2xl font-medium">{stats.neverReviewed}</div>
                    <div className="text-xs text-[#888888]">New</div>
                  </div>
                </div>
              )}

              {/* Start Review Button */}
              {queue.length > 0 ? (
                <button
                  onClick={startReview}
                  className="w-full flex items-center justify-center gap-3 p-4 bg-white text-black rounded-xl hover:bg-[#EAEAEA] transition-colors font-mono text-sm uppercase tracking-widest"
                >
                  <Brain className="w-5 h-5" />
                  Start Review ({queue.length} cards)
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-[#888888] mx-auto mb-4" />
                  <p className="text-[#888888]">All caught up! No reviews due.</p>
                  <p className="text-xs text-[#888888] mt-2">
                    Come back later or add more notes to your knowledge base.
                  </p>
                </div>
              )}

              {/* Queue Preview */}
              {queue.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-mono uppercase text-[#888888]">
                    Up Next
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {queue.slice(0, 5).map((note, i) => (
                      <div
                        key={note.id}
                        className="flex items-center gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                      >
                        <span className="text-xs text-[#888888] w-6">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm truncate">
                            {note.title || 'Untitled'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-[#888888]">
                            <span>{note.type}</span>
                            {note.daysOverdue > 0 && (
                              <span className="text-[#888888]">
                                {note.daysOverdue}d overdue
                              </span>
                            )}
                          </div>
                        </div>
                        <Clock className="w-4 h-4 text-[#888888]" />
                      </div>
                    ))}
                    {queue.length > 5 && (
                      <p className="text-xs text-[#888888] text-center py-2">
                        +{queue.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
