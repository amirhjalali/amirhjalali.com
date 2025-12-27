'use client'

import { useState, useEffect, useRef } from 'react'
import { Sparkles, X, Paperclip, Image as ImageIcon, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { NoteType } from '@/lib/types'

export default function QuickAdd({ onNoteAdded }: { onNoteAdded?: () => void }) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [detectedType, setDetectedType] = useState<NoteType>('TEXT')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auto-detect content type
  useEffect(() => {
    if (imageUrl) {
      setDetectedType('IMAGE')
      return
    }

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
  }, [content, imageUrl])

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

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported currently.')
      return
    }

    // Check file size (e.g. 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size should be less than 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        setImageUrl(e.target.result as string)
        setDetectedType('IMAGE')
        setError('')
      }
    }
    reader.readAsDataURL(file)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!content.trim() && !imageUrl) {
      setError('Content or an image is required')
      return
    }

    setIsLoading(true)

    try {
      await apiClient.createNote({
        type: detectedType,
        content: content.trim() || 'Image Note', // Fallback for image-only notes
        title: title.trim() || undefined,
        tags,
        imageUrl: imageUrl || undefined, // Pass the base64 image
        autoProcess: true,
      })

      // Clear form
      setContent('')
      setTitle('')
      setTags([])
      setTagInput('')
      setImageUrl(null)
      setError('')
      setSuccess('Note produced successfully')

      // Notify parent
      onNoteAdded?.()

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      console.error('Error creating note:', err)
      // Display detailed error message including status code if available
      const statusText = err.cause ? ` (Status: ${err.cause})` : ''
      const errorMessage = err.message || 'Failed to create note'
      setError(`${errorMessage}${statusText}`)
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
      <div className="space-y-4">
        {/* Drop Zone Area */}
        <div
          className={`relative group transition-all duration-300 rounded-xl border ${isDragging
              ? 'border-white/40 bg-white/10'
              : 'border-white/5 bg-black/10'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <textarea
            id="quick-add-input"
            placeholder="Drop images here, paste URLs, or type your thoughts..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-5 py-4 bg-transparent border-none focus:ring-0 text-[#EAEAEA] placeholder:text-[#666666] font-mono text-sm min-h-[120px] resize-y"
            disabled={isLoading}
            required={!imageUrl}
          />

          {/* Action Bar (at bottom of textarea) */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-[#666666] hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              title="Upload image"
            >
              <Paperclip className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Preview */}
        {imageUrl && (
          <div className="relative inline-block group">
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt="Upload preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setImageUrl(null)}
                  className="p-1.5 bg-white/10 hover:bg-red-500/20 text-white rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Auto-detected type indicator */}
        {(content || imageUrl) && (
          <div className="flex items-center justify-between text-xs px-1">
            <div className="flex items-center gap-2 text-[#666666]">
              {detectedType === 'IMAGE' ? (
                <ImageIcon className="w-3 h-3" />
              ) : (
                <Sparkles className="w-3 h-3" />
              )}
              <span className="font-mono">
                Detected as <span className="text-[#888888]">{typeLabels[detectedType]}</span>
              </span>
            </div>
            <span className="text-[#444444] font-mono hidden sm:inline">
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
                  className="hover:text-[#EAEAEA] transition-colors"
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

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-white/5 border border-white/20 rounded-xl text-[#EAEAEA] text-xs font-mono">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-white/10 border border-white/20 rounded-xl text-[#EAEAEA] text-xs font-mono">
          {success}
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading || (!content.trim() && !imageUrl)}
        className="w-full py-4 bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 border border-white/10 text-white font-mono text-xs uppercase tracking-[0.2em] rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-[0.98]"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
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
