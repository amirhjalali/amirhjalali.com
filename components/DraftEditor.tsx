'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Save, X, Eye, Download, Upload, BarChart3, Undo, Redo } from 'lucide-react'
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


  const handleSave = useCallback((isAutoSave = false) => {
    updateDraftArticle(editedDraft.id, editedDraft)
    setHasChanges(false)
    if (!isAutoSave) {
      onSave()
    }
  }, [editedDraft, onSave])

  const handleUndo = useCallback(() => {
    setHistoryIndex((prevIndex) => {
      if (prevIndex > 0) {
        const newIndex = prevIndex - 1
        setEditedDraft(history[newIndex])
        return newIndex
      }
      return prevIndex
    })
  }, [history])

  const handleRedo = useCallback(() => {
    setHistoryIndex((prevIndex) => {
      if (prevIndex < history.length - 1) {
        const newIndex = prevIndex + 1
        setEditedDraft(history[newIndex])
        return newIndex
      }
      return prevIndex
    })
  }, [history])

  const addToHistory = useCallback((newDraft: Article) => {
    setHistory((prevHistory) => {
      const nextHistory = prevHistory.slice(0, historyIndex + 1)
      nextHistory.push(newDraft)
      return nextHistory
    })
    setHistoryIndex((prevIndex) => prevIndex + 1)
  }, [historyIndex])

  const handleFieldChange = useCallback((field: keyof Article, value: any) => {
    const newDraft = { ...editedDraft, [field]: value }
    setEditedDraft(newDraft)
    addToHistory(newDraft)
  }, [editedDraft, addToHistory])

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        if (hasChanges) handleSave(false)
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        handleUndo()
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault()
        handleRedo()
      }
      if (e.key === 'Escape') {
        if (!hasChanges || confirm('You have unsaved changes. Close anyway?')) {
          onClose()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasChanges, handleSave, handleUndo, handleRedo, onClose])

  useEffect(() => {
    const changed = JSON.stringify(editedDraft) !== JSON.stringify(draft)
    setHasChanges(changed)

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
  }, [editedDraft, autoSaveTimer, draft, handleSave])

  const stats = {
    wordCount: editedDraft.content.trim().split(/\s+/).length,
    charCount: editedDraft.content.length,
    charCountNoSpaces: editedDraft.content.replace(/\s/g, '').length,
    readTime: `${Math.ceil(editedDraft.content.trim().split(/\s+/).length / 200)} min read`
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
              <span className="text-xs text-yellow-500 animate-pulse">● Unsaved changes</span>
            )}
            <span className="text-xs text-muted-foreground">
              Auto-saves every 2s
            </span>
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
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Title</label>
              <span className={`text-xs ${editedDraft.title.length > 100 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {editedDraft.title.length}/100
              </span>
            </div>
            <input
              type="text"
              value={editedDraft.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              maxLength={120}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-teal text-lg font-semibold"
            />
          </div>

          {/* Excerpt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Excerpt</label>
              <span className={`text-xs ${editedDraft.excerpt.length > 200 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {editedDraft.excerpt.length}/200
              </span>
            </div>
            <textarea
              value={editedDraft.excerpt}
              onChange={(e) => handleFieldChange('excerpt', e.target.value)}
              maxLength={250}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-teal resize-none"
              rows={2}
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium mb-2">Featured Image</label>

            {/* Image Preview */}
            {editedDraft.imageUrl && (
              <div className="mb-4 relative group">
                <img
                  src={editedDraft.imageUrl}
                  alt="Preview"
                  className="w-full max-h-64 object-cover rounded-xl border border-border"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                  <button
                    onClick={() => window.open(editedDraft.imageUrl, '_blank')}
                    className="px-4 py-2 bg-white/90 text-black rounded-lg hover:bg-white"
                  >
                    <Eye className="w-4 h-4 inline mr-2" />
                    View Full Size
                  </button>
                  <button
                    onClick={() => handleFieldChange('imageUrl', '')}
                    className="px-4 py-2 bg-red-500/90 text-white rounded-lg hover:bg-red-500"
                  >
                    <X className="w-4 h-4 inline mr-2" />
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Image Upload Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center justify-center px-4 py-3 glass border border-dashed border-border rounded-xl cursor-pointer hover:border-ai-teal/50 transition-colors">
                <Upload className="w-5 h-5 mr-2" />
                <span>Upload Image File</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or paste image URL"
                  defaultValue={editedDraft.imageUrl}
                  onBlur={(e) => {
                    if (e.target.value) {
                      handleFieldChange('imageUrl', e.target.value)
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleFieldChange('imageUrl', e.currentTarget.value)
                    }
                  }}
                  className="flex-1 px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-teal text-sm"
                />
              </div>
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
            <label className="block text-sm font-medium mb-2">
              Content (Markdown)
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                Supports markdown formatting
              </span>
            </label>
            <textarea
              value={editedDraft.content}
              onChange={(e) => {
                handleFieldChange('content', e.target.value)
                // Auto-resize
                e.target.style.height = 'auto'
                e.target.style.height = e.target.scrollHeight + 'px'
              }}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-teal font-mono text-sm resize-y min-h-[500px]"
              rows={25}
              placeholder="# Your Article Title

Start writing your article content here in markdown format...

## Section Heading

Regular paragraph text goes here."
              onFocus={(e) => {
                e.target.style.height = 'auto'
                e.target.style.height = Math.max(500, e.target.scrollHeight) + 'px'
              }}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              💡 Tip: The textarea will auto-resize as you type. You can also manually resize it.
            </p>
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
