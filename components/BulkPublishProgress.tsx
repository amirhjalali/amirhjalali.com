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
                <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              )}
              {isComplete && failCount === 0 && (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              )}
              {isComplete && failCount > 0 && (
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              )}
              <h2 className="text-xl font-semibold">
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
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
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
            <div className="mb-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span className="text-green-400">
                  Success: {successCount}
                </span>
              </div>
              {failCount > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400">
                    Failed: {failCount}
                  </span>
                </div>
              )}
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
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-red-500/10 border-red-500/30'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {result.success ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        Draft #{index + 1}
                        {result.title && `: ${result.title}`}
                      </p>
                      {result.error && (
                        <p className="text-xs text-red-400 mt-1">{result.error}</p>
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
                className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all font-medium"
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
