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
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              )}
              {isComplete && !hasError && (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              )}
              {hasError && <XCircle className="w-5 h-5 text-red-400" />}
              <h2 className="text-xl font-semibold">
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
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
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
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">
                  {stepLabels[currentStep]}
                </span>
              </div>
              <p className="text-sm text-[#cccccc]">{message}</p>
            </div>
          )}

          {/* Error Message */}
          {hasError && (
            <div className="mb-4 p-4 bg-red-500/10 rounded-lg border border-red-500/30">
              <p className="text-sm text-red-400">{error || message}</p>
            </div>
          )}

          {/* Success Message */}
          {isComplete && !hasError && (
            <div className="mb-4 p-4 bg-green-500/10 rounded-lg border border-green-500/30">
              <p className="text-sm text-green-400">
                {message || 'Your article has been generated and saved as a draft!'}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {isGenerating && !hasError && (
              <button
                onClick={onCancel}
                className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors font-medium"
              >
                Cancel
              </button>
            )}
            {!isGenerating && (
              <button
                onClick={onClose || onCancel}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all font-medium"
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
