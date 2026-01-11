'use client'

import { AIMetadata } from '@/lib/types'

interface ArticleModelAttributionProps {
  metadata?: AIMetadata
  className?: string
}

// Human-readable model names
const MODEL_DISPLAY_NAMES: Record<string, string> = {
  // OpenAI Text Models
  'gpt-5.2': 'GPT-5.2',
  'gpt-5.2-pro': 'GPT-5.2 Pro',
  'o4-mini': 'O4 Mini',
  'o3': 'O3',
  'gpt-5.1': 'GPT-5.1',
  'gpt-4o': 'GPT-4o',
  'gpt-4o-mini': 'GPT-4o Mini',
  // Anthropic Text Models
  'claude-opus-4-5-20251101': 'Claude Opus 4.5',
  'claude-opus-4.5': 'Claude Opus 4.5',
  'claude-sonnet-4-5-20250929': 'Claude Sonnet 4.5',
  'claude-sonnet-4.5': 'Claude Sonnet 4.5',
  'claude-haiku-4-5-20251001': 'Claude Haiku 4.5',
  'claude-haiku-4.5': 'Claude Haiku 4.5',
  'claude-sonnet-4-20250514': 'Claude Sonnet 4',
  'claude-sonnet-4': 'Claude Sonnet 4',
  // Google Text Models
  'gemini-3-flash-preview': 'Gemini 3 Flash',
  'gemini-3-pro-preview': 'Gemini 3 Pro',
  'gemini-2.5-flash': 'Gemini 2.5 Flash',
  'gemini-2.5-pro': 'Gemini 2.5 Pro',
  // OpenAI Image Models
  'gpt-image-1.5': 'GPT Image 1.5',
  'gpt-image-1': 'GPT Image 1',
  'dall-e-3': 'DALL-E 3',
  // Google Image Models
  'gemini-3-pro-image-preview': 'Nano Banana Pro',
  'imagen-4.0-generate-001': 'Imagen 4',
  'imagen-4': 'Imagen 4',
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
