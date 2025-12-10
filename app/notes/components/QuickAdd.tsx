'use client'

import { useState, useEffect } from 'react'
import { Link as LinkIcon, FileText, Image, Video, Plus, X } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { NoteType } from '@/lib/types'

export default function QuickAdd({ onNoteAdded }: { onNoteAdded?: () => void }) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<NoteType>('TEXT')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Auto-detect type based on content
  useEffect(() => {
    const isUrl = content.startsWith('http://') || content.startsWith('https://')
    const newType = isUrl ? 'LINK' : 'TEXT'

    // Only update if type actually changes (prevents unnecessary re-renders)
    if (newType !== type) {
      setType(newType)
    }
  }, [content, type])

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
        type,
        content: content.trim(),
        title: title.trim() || undefined,
        tags,
        autoProcess: true,
      })

      // Clear form
      setContent('')
      setTitle('')
      setTags([])
      setType('TEXT')
      setError('')

      // Notify parent
      onNoteAdded?.()
    } catch (err: any) {
      setError(err.message || 'Failed to create note')
    } finally {
      setIsLoading(false)
    }
  }

  const typeIcons = {
    LINK: LinkIcon,
    TEXT: FileText,
    IMAGE: Image,
    VIDEO: Video,
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type Selector */}
      <div className="flex gap-2">
        {(['LINK', 'TEXT', 'IMAGE', 'VIDEO'] as NoteType[]).map((t) => {
          const Icon = typeIcons[t]
          return (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-widest transition-all ${
                type === t
                  ? 'bg-white/20 text-white border border-white/30'
                  : 'bg-black/20 text-[#888888] border border-white/10 hover:border-white/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t}
            </button>
          )
        })}
      </div>

      {/* Title Input (Optional) */}
      <div>
        <input
          type="text"
          placeholder="Title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-[#EAEAEA] placeholder:text-[#888888]/50 transition-all font-mono text-sm"
          disabled={isLoading}
        />
      </div>

      {/* Content Input */}
      <div>
        <textarea
          id="quick-add-input"
          placeholder={
            type === 'LINK'
              ? 'Paste URL here...'
              : type === 'TEXT'
              ? 'Enter your note...'
              : type === 'IMAGE'
              ? 'Paste image URL...'
              : 'Paste video URL...'
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-[#EAEAEA] placeholder:text-[#888888]/50 transition-all font-mono text-sm min-h-[100px] resize-y"
          disabled={isLoading}
          required
        />
        <p className="text-xs text-[#888888] mt-1 font-mono">
          Tip: Press <kbd className="px-1.5 py-0.5 bg-white/10 rounded">⌘K</kbd> to focus
        </p>
      </div>

      {/* Tags Input */}
      <div>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/20 rounded-lg text-xs font-mono"
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
        <input
          type="text"
          placeholder="Add tags (press Enter)..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleAddTag}
          className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-[#EAEAEA] placeholder:text-[#888888]/50 transition-all font-mono text-sm"
          disabled={isLoading}
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || !content.trim()}
        className="w-full py-3 bg-[#EAEAEA] text-[#050505] font-mono text-xs uppercase tracking-widest font-bold rounded-xl hover:bg-white active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-[#050505]/30 border-t-[#050505] rounded-full animate-spin" />
            Creating...
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Add & Process
          </>
        )}
      </button>
    </form>
  )
}
