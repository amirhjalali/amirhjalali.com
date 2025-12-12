'use client'

import { useState, useEffect } from 'react'
import { Sparkles, X } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { NoteType } from '@/lib/types'

export default function QuickAdd({ onNoteAdded }: { onNoteAdded?: () => void }) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [detectedType, setDetectedType] = useState<NoteType>('TEXT')

  // Auto-detect content type
  useEffect(() => {
    if (!content.trim()) {
      setDetectedType('TEXT')
      return
    }

    const trimmed = content.trim()

    // Detect URLs
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      // Check if it's an image URL
      if (/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(trimmed)) {
        setDetectedType('IMAGE')
      }
      // Check if it's a video URL
      else if (/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(trimmed) ||
               /youtube\.com|youtu\.be|vimeo\.com/i.test(trimmed)) {
        setDetectedType('VIDEO')
      }
      // Otherwise it's a link
      else {
        setDetectedType('LINK')
      }
    } else {
      setDetectedType('TEXT')
    }
  }, [content])

  // Keyboard shortcut: Cmd+K to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('quick-add-input')?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!content.trim()) {
      setError('Content is required')
      return
    }

    setIsLoading(true)

    try {
      await apiClient.createNote({
        type: detectedType,
        content: content.trim(),
        title: title.trim() || undefined,
        tags,
        autoProcess: true,
      })

      // Clear form
      setContent('')
      setTitle('')
      setTags([])
      setError('')

      // Notify parent
      onNoteAdded?.()
    } catch (err: any) {
      console.error('Error creating note:', err)
      const errorMessage = err.message || 'Failed to create note'
      setError(`${errorMessage}${err.cause ? ` (${err.cause})` : ''}`)
    } finally {
      setIsLoading(false)
    }
  }

  const typeLabels = {
    LINK: 'Link',
    TEXT: 'Text',
    IMAGE: 'Image',
    VIDEO: 'Video',
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Universal Content Input */}
      <div className="space-y-2">
        <textarea
          id="quick-add-input"
          placeholder="Drop anything here... links, text, images, videos..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-5 py-4 bg-black/10 border border-white/5 rounded-xl focus:outline-none focus:border-white/20 focus:bg-black/20 text-[#EAEAEA] placeholder:text-[#666666] transition-all font-mono text-sm min-h-[120px] resize-y"
          disabled={isLoading}
          required
        />

        {/* Auto-detected type indicator */}
        {content && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-[#666666]">
              <Sparkles className="w-3 h-3" />
              <span className="font-mono">
                Detected as <span className="text-[#888888]">{typeLabels[detectedType]}</span>
              </span>
            </div>
            <span className="text-[#444444] font-mono">
              Press <kbd className="px-1.5 py-0.5 bg-white/5 rounded">⌘K</kbd> to focus
            </span>
          </div>
        )}
      </div>

      {/* Optional Title */}
      <input
        type="text"
        placeholder="Title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full px-5 py-3 bg-black/10 border border-white/5 rounded-xl focus:outline-none focus:border-white/20 focus:bg-black/20 text-[#EAEAEA] placeholder:text-[#666666] transition-all font-mono text-sm"
        disabled={isLoading}
      />

      {/* Tags */}
      <div className="space-y-3">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-[#888888]"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <input
          type="text"
          placeholder="Add tags (press Enter)..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="w-full px-5 py-3 bg-black/10 border border-white/5 rounded-xl focus:outline-none focus:border-white/20 focus:bg-black/20 text-[#EAEAEA] placeholder:text-[#666666] transition-all font-mono text-sm"
          disabled={isLoading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-red-400 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !content.trim()}
        className="w-full py-4 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 text-white font-mono text-xs uppercase tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Capture & Process
          </>
        )}
      </button>
    </form>
  )
}
