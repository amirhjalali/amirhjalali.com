'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Sparkles, ArrowRight } from 'lucide-react'
import { getTextModelOptions, getImageModelOptions } from '@/lib/eval-models'
import { apiClient, Draft } from '@/lib/api-client'

interface EvalGeneratorModalProps {
  isOpen: boolean
  onClose: () => void
  onGenerated: (comparison: any, draftA: Draft, draftB: Draft) => void
}

export default function EvalGeneratorModal({
  isOpen,
  onClose,
  onGenerated,
}: EvalGeneratorModalProps) {
  const [topic, setTopic] = useState('')
  const [modelA, setModelA] = useState('gpt-5.2')
  const [modelB, setModelB] = useState('claude-opus-4.5')
  const [imageModel, setImageModel] = useState('dall-e-3')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')

  const textModels = getTextModelOptions()
  const imageModels = getImageModelOptions()

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic')
      return
    }

    if (modelA === modelB) {
      setError('Please select two different models to compare')
      return
    }

    setIsGenerating(true)
    setError(null)
    setProgress('Starting generation...')

    try {
      const result = await apiClient.generateEvalPair({
        topic: topic.trim(),
        modelA,
        modelB,
        imageModel,
      })

      setProgress('Complete!')
      onGenerated(result.comparison, result.draftA, result.draftB)

      // Reset form
      setTopic('')
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate eval pair')
    } finally {
      setIsGenerating(false)
      setProgress('')
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && !isGenerating && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-lg mx-4 bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-serif font-light">New Eval Comparison</h2>
              <p className="text-xs font-mono uppercase tracking-widest text-[#888888] mt-1">
                A/B Test AI Models
              </p>
            </div>
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-[#888888]" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Topic Input */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[#888888] mb-2">
                Topic
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter article topic..."
                disabled={isGenerating}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-sm placeholder:text-[#666666] disabled:opacity-50"
              />
            </div>

            {/* Model Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[#888888] mb-2">
                  Model A
                </label>
                <select
                  value={modelA}
                  onChange={(e) => setModelA(e.target.value)}
                  disabled={isGenerating}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-sm disabled:opacity-50"
                >
                  {textModels.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-[#888888] mb-2">
                  Model B
                </label>
                <select
                  value={modelB}
                  onChange={(e) => setModelB(e.target.value)}
                  disabled={isGenerating}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-sm disabled:opacity-50"
                >
                  {textModels.map((model) => (
                    <option key={model.value} value={model.value}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Image Model */}
            <div>
              <label className="block text-xs font-mono uppercase tracking-widest text-[#888888] mb-2">
                Image Model (shared)
              </label>
              <select
                value={imageModel}
                onChange={(e) => setImageModel(e.target.value)}
                disabled={isGenerating}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-sm disabled:opacity-50"
              >
                {imageModels.map((model) => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] font-mono text-[#666666] mt-1">
                Both articles will use the same image model for fair comparison
              </p>
            </div>

            {/* Comparison Preview */}
            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <div className="flex items-center justify-center gap-4 text-sm">
                <span className="px-3 py-1 bg-white/10 rounded-full">
                  {textModels.find((m) => m.value === modelA)?.label || modelA}
                </span>
                <ArrowRight className="w-4 h-4 text-[#666666]" />
                <span className="text-[#888888]">vs</span>
                <ArrowRight className="w-4 h-4 text-[#666666] rotate-180" />
                <span className="px-3 py-1 bg-white/10 rounded-full">
                  {textModels.find((m) => m.value === modelB)?.label || modelB}
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-white/5 border border-white/20 rounded-lg text-sm text-[#EAEAEA]">
                {error}
              </div>
            )}

            {/* Progress */}
            {isGenerating && progress && (
              <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-[#888888]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progress}</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-widest disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !topic.trim() || modelA === modelB}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-[#EAEAEA] transition-colors font-mono text-xs uppercase tracking-widest font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Pair
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
