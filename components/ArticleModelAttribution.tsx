'use client'

import { AIMetadata } from '@/lib/types'

interface ArticleModelAttributionProps {
  metadata?: AIMetadata
  className?: string
}

// Human-readable model names
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  // OpenAI
  'gpt-5.2': 'GPT-5.2',
  'gpt-5.2-thinking': 'GPT-5.2 Thinking',
  'gpt-5.1': 'GPT-5.1',
  'gpt-5': 'GPT-5',
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  // Anthropic
  'claude-opus-4-5-20251101': 'Claude Opus 4.5',
  'claude-opus-4.5': 'Claude Opus 4.5',
  'claude-sonnet-4-20250514': 'Claude Sonnet 4',
  'claude-sonnet-4': 'Claude Sonnet 4',
  'claude-3-5-sonnet-20241022': 'Claude 3.5 Sonnet',
  // Google
  'gemini-3-flash-preview': 'Gemini 3 Flash',
  'gemini-3-pro-preview': 'Gemini 3 Pro',
  'gemini-3-pro-image-preview': 'Gemini 3 Pro',
  'gemini-2.0-flash': 'Gemini 2.0 Flash',
  // Image models
  'dall-e-3': 'DALL-E 3',
}

function getDisplayName(modelId: string | undefined): string {
  if (!modelId) return 'Unknown'
  return MODEL_DISPLAY_NAMES[modelId] || modelId
}

export default function ArticleModelAttribution({ metadata, className = '' }: ArticleModelAttributionProps) {
  if (!metadata?.textModel && !metadata?.imageModel) {
    return null
  }

  const textModel = getDisplayName(metadata.textModel)
  const imageModel = getDisplayName(metadata.imageModel)

  return (
    <div className={`flex flex-wrap items-center gap-3 text-[10px] font-mono uppercase tracking-widest text-[#666666] ${className}`}>
      <span className="text-[#444444]">Generated with</span>

      {metadata.textModel && (
        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded">
          {textModel}
        </span>
      )}

      {metadata.textModel && metadata.imageModel && (
        <span className="text-[#333333]">+</span>
      )}

      {metadata.imageModel && (
        <span className="px-2 py-1 bg-white/5 border border-white/10 rounded">
          {imageModel}
        </span>
      )}

      {metadata.evalGroup && (
        <>
          <span className="text-[#333333]">|</span>
          <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[#888888]">
            Eval {metadata.variantId || '?'}
          </span>
        </>
      )}
    </div>
  )
}
