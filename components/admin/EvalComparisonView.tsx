'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Check, Minus, Eye, EyeOff, Loader2, Trophy } from 'lucide-react'
import { apiClient, Draft } from '@/lib/api-client'
import { EVAL_TEXT_MODELS } from '@/lib/eval-models'

interface EvalComparisonViewProps {
  comparison: {
    id: string
    topic: string
    modelA: string
    modelB: string
    status: string
    winner?: string
    winnerReason?: string
  }
  draftA: Draft | null
  draftB: Draft | null
  onClose: () => void
  onEvaluated: () => void
}

export default function EvalComparisonView({
  comparison,
  draftA,
  draftB,
  onClose,
  onEvaluated,
}: EvalComparisonViewProps) {
  const [showModels, setShowModels] = useState(comparison.status === 'evaluated')
  const [selectedWinner, setSelectedWinner] = useState<'A' | 'B' | 'tie' | null>(
    comparison.winner as 'A' | 'B' | 'tie' | null
  )
  const [reason, setReason] = useState(comparison.winnerReason || '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isEvaluated = comparison.status === 'evaluated'

  const handleSubmit = async () => {
    if (!selectedWinner) {
      setError('Please select a winner')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await apiClient.submitEvaluation(comparison.id, {
        winner: selectedWinner,
        reason: reason.trim() || undefined,
      })
      onEvaluated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit evaluation')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getModelName = (modelId: string) => {
    return EVAL_TEXT_MODELS[modelId]?.name || modelId
  }

  const renderArticleCard = (draft: Draft | null, variant: 'A' | 'B') => {
    if (!draft) {
      return (
        <div className="flex-1 p-6 border border-white/10 rounded-xl bg-white/5 flex items-center justify-center">
          <p className="text-[#888888] text-sm">Article not found</p>
        </div>
      )
    }

    const isWinner = comparison.winner === variant
    const modelId = variant === 'A' ? comparison.modelA : comparison.modelB

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: variant === 'A' ? 0 : 0.1 }}
        className={`flex-1 border rounded-xl overflow-hidden ${
          isWinner ? 'border-white/30 bg-white/10' : 'border-white/10 bg-white/5'
        }`}
      >
        {/* Card Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full font-mono text-sm">
              {variant}
            </span>
            {showModels && (
              <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono">
                {getModelName(modelId)}
              </span>
            )}
          </div>
          {isWinner && (
            <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full">
              <Trophy className="w-3 h-3" />
              <span className="text-xs font-mono uppercase">Winner</span>
            </div>
          )}
        </div>

        {/* Image */}
        {draft.imageUrl && (
          <div className="h-48 overflow-hidden">
            <img
              src={draft.imageUrl}
              alt={draft.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-4 space-y-3">
          <h3 className="font-serif text-lg font-light line-clamp-2">
            {draft.title}
          </h3>
          <p className="text-sm text-[#888888] line-clamp-3 font-light">
            {draft.excerpt}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1">
            {draft.tags?.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest text-[#888888]"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Word count */}
          <p className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">
            {draft.content?.split(/\s+/).length || 0} words
          </p>
        </div>

        {/* Selection Button (for pending evaluations) */}
        {!isEvaluated && (
          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => setSelectedWinner(variant)}
              className={`w-full py-3 rounded-lg font-mono text-xs uppercase tracking-widest transition-all ${
                selectedWinner === variant
                  ? 'bg-white text-black'
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              {selectedWinner === variant ? (
                <span className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  Selected
                </span>
              ) : (
                `Pick ${variant}`
              )}
            </button>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#050505] overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#050505]/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-xl font-light">Eval Comparison</h1>
            <p className="text-xs font-mono uppercase tracking-widest text-[#888888] mt-1">
              Topic: {comparison.topic}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModels(!showModels)}
              className="flex items-center gap-2 px-3 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-widest"
            >
              {showModels ? (
                <>
                  <EyeOff className="w-4 h-4" />
                  Hide Models
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4" />
                  Reveal Models
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[#888888]" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Side by side comparison */}
        <div className="flex gap-6 mb-8">
          {renderArticleCard(draftA, 'A')}
          {renderArticleCard(draftB, 'B')}
        </div>

        {/* Evaluation Controls */}
        {!isEvaluated && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 border border-white/10 rounded-xl bg-white/5"
          >
            <h3 className="font-serif text-lg font-light mb-4">Submit Evaluation</h3>

            {/* Tie option */}
            <div className="mb-4">
              <button
                onClick={() => setSelectedWinner('tie')}
                className={`w-full py-3 rounded-lg font-mono text-xs uppercase tracking-widest transition-all ${
                  selectedWinner === 'tie'
                    ? 'bg-white text-black'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                {selectedWinner === 'tie' ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="w-4 h-4" />
                    Tie Selected
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Minus className="w-4 h-4" />
                    It&apos;s a Tie
                  </span>
                )}
              </button>
            </div>

            {/* Reason */}
            <div className="mb-4">
              <label className="block text-xs font-mono uppercase tracking-widest text-[#888888] mb-2">
                Reason (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why did you choose this winner?"
                rows={3}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-sm placeholder:text-[#666666] resize-none"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-white/5 border border-white/20 rounded-lg text-sm text-[#EAEAEA]">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedWinner}
              className="w-full py-3 bg-white text-black rounded-lg hover:bg-[#EAEAEA] transition-colors font-mono text-xs uppercase tracking-widest font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Submit Evaluation
                </>
              )}
            </button>
          </motion.div>
        )}

        {/* Already evaluated message */}
        {isEvaluated && comparison.winnerReason && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 border border-white/10 rounded-xl bg-white/5"
          >
            <h3 className="font-mono text-xs uppercase tracking-widest text-[#888888] mb-2">
              Evaluation Reason
            </h3>
            <p className="text-sm text-[#EAEAEA]">{comparison.winnerReason}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
