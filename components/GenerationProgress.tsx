'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, XCircle, Clock, Sparkles } from 'lucide-react'
import { GenerationStep } from '@/lib/types'

interface GenerationProgressProps {
  isOpen: boolean
  progress: number
  currentStep: GenerationStep | null
  message: string
  estimatedTimeRemaining?: number
  error: string | null
  isGenerating: boolean
  onCancel: () => void
  onClose?: () => void
}

const stepLabels: Record<GenerationStep, string> = {
  initializing: 'Initializing',
  generating_title: 'Generating Title',
  generating_content: 'Generating Content',
  generating_excerpt: 'Generating Excerpt',
  generating_tags: 'Generating Tags',
  generating_image: 'Generating Image',
  downloading_image: 'Processing Image',
  saving_draft: 'Saving Draft',
  completed: 'Completed',
  error: 'Error',
  // Eval-specific steps
  generating_article_a: 'Generating Article A',
  generating_article_b: 'Generating Article B',
  articles_generated: 'Articles Generated',
}

export default function GenerationProgress({
  isOpen,
  progress,
  currentStep,
  message,
  estimatedTimeRemaining,
  error,
  isGenerating,
  onCancel,
  onClose,
}: GenerationProgressProps) {
  if (!isOpen) return null

  const isComplete = currentStep === 'completed'
  const hasError = currentStep === 'error' || !!error

  const formatTime = (seconds?: number) => {
    if (!seconds) return ''
    if (seconds < 60) return `${seconds}s remaining`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s remaining`
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isGenerating) {
            onClose?.()
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md p-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {isGenerating && !hasError && (
                <Loader2 className="w-5 h-5 text-[#888888] animate-spin" />
              )}
              {isComplete && !hasError && (
                <CheckCircle2 className="w-5 h-5 text-[#EAEAEA]" />
              )}
              {hasError && <XCircle className="w-5 h-5 text-[#888888]" />}
              <h2 className="text-xl font-serif font-light">
                {isGenerating
                  ? 'Generating Article'
                  : isComplete
                  ? 'Article Generated!'
                  : hasError
                  ? 'Generation Failed'
                  : 'Article Generation'}
              </h2>
            </div>
            {(!isGenerating || hasError) && (
              <button
                onClick={onClose || onCancel}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
          {!hasError && (
            <div className="mb-6">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-sm text-[#888888]">
                <span>{progress}%</span>
                {estimatedTimeRemaining !== undefined && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(estimatedTimeRemaining)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Step */}
          {currentStep && !hasError && (
            <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-[#888888]" />
                <span className="text-xs font-mono uppercase tracking-widest text-[#EAEAEA]">
                  {stepLabels[currentStep]}
                </span>
              </div>
              <p className="text-sm text-[#888888]">{message}</p>
            </div>
          )}

          {/* Error Message */}
          {hasError && (
            <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/20">
              <p className="text-sm text-[#888888]">{error || message}</p>
            </div>
          )}

          {/* Success Message */}
          {isComplete && !hasError && (
            <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/20">
              <p className="text-sm text-[#EAEAEA]">
                {message || 'Your article has been generated and saved as a draft.'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {isGenerating && !hasError && (
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors font-mono text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
            )}
            {!isGenerating && (
              <button
                onClick={onClose || onCancel}
                className="flex-1 px-4 py-2 bg-white text-black hover:bg-[#EAEAEA] rounded-lg transition-all font-mono text-xs uppercase tracking-widest"
              >
                {isComplete ? 'Close' : 'Dismiss'}
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
