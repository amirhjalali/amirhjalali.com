'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, X, Eye, Download, Upload, Copy, BarChart3, Undo, Redo } from 'lucide-react'
import { type Article, updateDraftArticle } from '@/lib/articles'

interface DraftEditorProps {
  draft: Article
  onSave: () => void
  onClose: () => void
}

export default function DraftEditor({ draft, onSave, onClose }: DraftEditorProps) {
  const [editedDraft, setEditedDraft] = useState<Article>(draft)
  const [hasChanges, setHasChanges] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [history, setHistory] = useState<Article[]>([draft])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(editedDraft) !== JSON.stringify(draft)
    setHasChanges(changed)

    // Auto-save after 2 seconds of inactivity
    if (changed && autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }

    if (changed) {
      const timer = setTimeout(() => {
        handleSave(true)
      }, 2000)
      setAutoSaveTimer(timer)
    }

    return () => {
      if (autoSaveTimer) clearTimeout(autoSaveTimer)
    }
  }, [editedDraft])

  // Calculate statistics
  const stats = {
    wordCount: editedDraft.content.trim().split(/\s+/).length,
    charCount: editedDraft.content.length,
    charCountNoSpaces: editedDraft.content.replace(/\s/g, '').length,
    readTime: `${Math.ceil(editedDraft.content.trim().split(/\s+/).length / 200)} min read`
  }

  const handleSave = (isAutoSave = false) => {
    updateDraftArticle(editedDraft.id, editedDraft)
    setHasChanges(false)
    if (!isAutoSave) {
      onSave()
    }
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      setEditedDraft(history[newIndex])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      setEditedDraft(history[newIndex])
    }
  }

  const addToHistory = (newDraft: Article) => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(newDraft)
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleFieldChange = (field: keyof Article, value: any) => {
    const newDraft = { ...editedDraft, [field]: value }
    setEditedDraft(newDraft)
    addToHistory(newDraft)
  }

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !editedDraft.tags.includes(tag.trim())) {
      handleFieldChange('tags', [...editedDraft.tags, tag.trim()])
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    handleFieldChange('tags', editedDraft.tags.filter(tag => tag !== tagToRemove))
  }

  const handleExport = () => {
    const markdown = `# ${editedDraft.title}

${editedDraft.excerpt}

Tags: ${editedDraft.tags.join(', ')}
Author: ${editedDraft.author}

---

${editedDraft.content}`

    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${editedDraft.title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        handleFieldChange('imageUrl', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="glass border border-border rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-semibold">Edit Draft</h2>
            {hasChanges && (
              <span className="text-xs text-yellow-500">● Unsaved changes</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="p-2 glass border border-border rounded-lg hover:border-ai-teal/50 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="p-2 glass border border-border rounded-lg hover:border-ai-teal/50 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 glass border border-border rounded-lg hover:border-ai-teal/50"
              title="Statistics"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 glass border border-border rounded-lg hover:border-ai-teal/50"
              title="Export as Markdown"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 glass border border-border rounded-lg hover:border-red-500/50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Panel */}
        {showStats && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            className="p-4 bg-accent/50 border-b border-border grid grid-cols-4 gap-4 text-center"
          >
            <div>
              <div className="text-2xl font-bold">{stats.wordCount}</div>
              <div className="text-xs text-muted-foreground">Words</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.charCount}</div>
              <div className="text-xs text-muted-foreground">Characters</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.charCountNoSpaces}</div>
              <div className="text-xs text-muted-foreground">Chars (no spaces)</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stats.readTime}</div>
              <div className="text-xs text-muted-foreground">Read Time</div>
            </div>
          </motion.div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={editedDraft.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-teal text-lg font-semibold"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium mb-2">Excerpt</label>
            <textarea
              value={editedDraft.excerpt}
              onChange={(e) => handleFieldChange('excerpt', e.target.value)}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-teal resize-none"
              rows={2}
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-2">Featured Image</label>
            <div className="flex gap-4">
              {editedDraft.imageUrl && (
                <img
                  src={editedDraft.imageUrl}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-xl border border-border"
                />
              )}
              <label className="flex-1 flex items-center justify-center px-4 py-3 glass border border-dashed border-border rounded-xl cursor-pointer hover:border-ai-teal/50 transition-colors">
                <Upload className="w-5 h-5 mr-2" />
                <span>Upload New Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Tags</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {editedDraft.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-accent rounded-full text-sm"
                >
                  {tag}
                  <button
                    onClick={() => handleTagRemove(tag)}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tag and press Enter"
              className="w-full px-4 py-2 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-teal text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTagAdd(e.currentTarget.value)
                  e.currentTarget.value = ''
                }
              }}
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium mb-2">Author</label>
            <input
              type="text"
              value={editedDraft.author}
              onChange={(e) => handleFieldChange('author', e.target.value)}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-teal"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Content (Markdown)</label>
            <textarea
              value={editedDraft.content}
              onChange={(e) => handleFieldChange('content', e.target.value)}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-teal font-mono text-sm resize-none"
              rows={20}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-6 py-3 glass border border-border rounded-xl hover:border-red-500/50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={!hasChanges}
            className="px-6 py-3 bg-gradient-to-r from-ai-teal to-ai-cyan dark:from-ai-green dark:to-ai-blue text-white font-semibold rounded-xl hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
