'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'

interface BulkPublishResult {
  id: string
  title?: string
  success: boolean
  error?: string
}

interface BulkPublishProgressProps {
  isOpen: boolean
  isPublishing: boolean
  currentIndex: number
  total: number
  results: BulkPublishResult[]
  onClose: () => void
}

export default function BulkPublishProgress({
  isOpen,
  isPublishing,
  currentIndex,
  total,
  results,
  onClose,
}: BulkPublishProgressProps) {
  if (!isOpen) return null

  const successCount = results.filter(r => r.success).length
  const failCount = results.filter(r => !r.success).length
  const progress = total > 0 ? Math.round((results.length / total) * 100) : 0
  const isComplete = results.length === total && !isPublishing

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isPublishing) {
            onClose()
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass w-full max-w-md rounded-2xl border border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md p-6 max-h-[80vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {isPublishing && (
                <Loader2 className="w-5 h-5 text-[#888888] animate-spin" />
              )}
              {isComplete && failCount === 0 && (
                <CheckCircle2 className="w-5 h-5 text-[#EAEAEA]" />
              )}
              {isComplete && failCount > 0 && (
                <AlertCircle className="w-5 h-5 text-[#888888]" />
              )}
              <h2 className="text-xl font-serif font-light">
                {isPublishing
                  ? 'Publishing Drafts'
                  : isComplete && failCount === 0
                  ? 'All Drafts Published!'
                  : isComplete
                  ? 'Publishing Complete'
                  : 'Bulk Publish'}
              </h2>
            </div>
            {!isPublishing && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Progress Bar */}
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
              <span>
                {isPublishing ? (
                  <>Publishing {currentIndex + 1} of {total}</>
                ) : (
                  <>{results.length} of {total} processed</>
                )}
              </span>
              <span>{progress}%</span>
            </div>
          </div>

          {/* Summary (when complete) */}
          {isComplete && (
            <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-4 text-sm font-mono uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#EAEAEA]" />
                  <span className="text-[#EAEAEA]">
                    Success: {successCount}
                  </span>
                </div>
                {failCount > 0 && (
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-[#888888]" />
                    <span className="text-[#888888]">
                      Failed: {failCount}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Results List */}
          <div className="flex-1 overflow-y-auto mb-4 space-y-2 min-h-0">
            <AnimatePresence mode="popLayout">
              {results.map((result, index) => (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`p-3 rounded-lg border ${
                    result.success
                      ? 'bg-white/5 border-white/20'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle2 className="w-4 h-4 text-[#EAEAEA] mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-[#888888] mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">
                        Draft #{index + 1}
                        {result.title && `: ${result.title}`}
                      </p>
                      {result.error && (
                        <p className="text-xs text-[#888888] mt-1">{result.error}</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Actions */}
          {!isPublishing && (
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white text-black hover:bg-[#EAEAEA] rounded-lg transition-all font-mono text-xs uppercase tracking-widest"
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
