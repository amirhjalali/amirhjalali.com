'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Save, X, Eye, Download, Upload, BarChart3, Undo, Redo, Sparkles, Image as ImageIcon, Calendar } from 'lucide-react'
import { apiClient, type Draft, type Article } from '@/lib/api-client'
import GenerationSettingsModal from './GenerationSettingsModal'
import GenerationProgress from './GenerationProgress'
import { useGenerationProgress } from '@/hooks/useGenerationProgress'
import { AIMetadata } from '@/lib/types'

interface DraftEditorProps {
  draft: Draft | Article
  type?: 'draft' | 'article'
  onSave: () => void
  onClose: () => void
}

export default function DraftEditor({ draft, type = 'draft', onSave, onClose }: DraftEditorProps) {
  const [editedDraft, setEditedDraft] = useState<Draft | Article>(draft)
  const [hasChanges, setHasChanges] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [history, setHistory] = useState<(Draft | Article)[]>([draft])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // New state for modals and scheduling
  const [showRegenContentModal, setShowRegenContentModal] = useState(false)
  const [showRegenImageModal, setShowRegenImageModal] = useState(false)
  const [_isRegenerating, setIsRegenerating] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduledDate, setScheduledDate] = useState<string>(
    (draft.metadata as any)?.scheduledPublishDate || ''
  )

  // Progress tracking for image regeneration
  const {
    isGenerating: isRegeneratingImage,
    progress,
    currentStep,
    message,
    estimatedTimeRemaining,
    error: regenerationError,
    result: regenerationResult,
    startGeneration,
    cancelGeneration,
  } = useGenerationProgress()

  const handleSave = useCallback(async (isAutoSave = false) => {
    if (isSaving) return

    setIsSaving(true)
    try {
      // Include scheduled date in metadata if set
      const metadata = {
        ...(editedDraft.metadata || {}),
        scheduledPublishDate: scheduledDate || undefined
      }

      const itemToSave = {
        ...editedDraft,
        metadata
      }

      if (type === 'article') {
        await apiClient.updateArticle(itemToSave.id, itemToSave as Article)
      } else {
        await apiClient.updateDraft(itemToSave.id, itemToSave as Draft)
      }

      setHasChanges(false)
      if (!isAutoSave) {
        onSave()
      }
    } catch (error) {
      console.error('Error saving:', error)
      if (!isAutoSave) {
        alert('Failed to save. Please try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }, [editedDraft, onSave, isSaving, scheduledDate, type])

  const handleRegenerateContent = async (settings: AIMetadata) => {
    setIsRegenerating(true)
    try {
      const updatedDraft = await apiClient.regenerateContent(editedDraft.id, settings)
      setEditedDraft(updatedDraft)
      addToHistory(updatedDraft)
      setHasChanges(true)
    } catch (error) {
      console.error('Error regenerating content:', error)
      alert('Failed to regenerate content.')
    } finally {
      setIsRegenerating(false)
    }
  }

  const handleRegenerateImage = async (settings: AIMetadata) => {
    await startGeneration(`/api/regenerate-image?stream=true`, { id: editedDraft.id, ...settings })
  }

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

  const addToHistory = useCallback((newDraft: Draft | Article) => {
    setHistory((prevHistory) => {
      const nextHistory = prevHistory.slice(0, historyIndex + 1)
      nextHistory.push(newDraft)
      return nextHistory
    })
    setHistoryIndex((prevIndex) => prevIndex + 1)
  }, [historyIndex])

  const handleFieldChange = useCallback((field: keyof (Draft | Article), value: any) => {
    const newDraft = { ...editedDraft, [field]: value }
    setEditedDraft(newDraft as Draft | Article)
    addToHistory(newDraft as Draft | Article)
  }, [editedDraft, addToHistory])

  // Handle image regeneration completion
  useEffect(() => {
    if (regenerationResult && !isRegeneratingImage && !regenerationError) {
      // Update from the returned draft/article if available
      if (regenerationResult.draft) {
        setEditedDraft(regenerationResult.draft)
        addToHistory(regenerationResult.draft)
        setHasChanges(true)
      } else if (regenerationResult.article) {
        setEditedDraft(regenerationResult.article)
        addToHistory(regenerationResult.article)
        setHasChanges(true)
      } else if (regenerationResult.imageUrl) {
        // Fallback: just update the image URL
        handleFieldChange('imageUrl', regenerationResult.imageUrl)
      }
    }
  }, [regenerationResult, isRegeneratingImage, regenerationError, handleFieldChange, addToHistory])

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

${editedDraft.excerpt || ''}

Tags: ${editedDraft.tags.join(', ')}

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
    const changed = JSON.stringify(editedDraft) !== JSON.stringify(draft) ||
      scheduledDate !== ((draft.metadata as any)?.scheduledPublishDate || '')
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
  }, [editedDraft, autoSaveTimer, draft, handleSave, scheduledDate])

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
              <span className="text-xs text-[#888888] animate-pulse">● Unsaved changes</span>
            )}
            <span className="text-xs text-muted-foreground">
              Auto-saves every 2s
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRegenContentModal(true)}
              className="px-3 py-2 glass border border-border rounded-lg hover:border-white/30 text-xs font-mono uppercase tracking-widest flex items-center gap-2"
              title="Regenerate Content"
            >
              <Sparkles className="w-3 h-3" />
              Regen Text
            </button>
            <button
              onClick={() => setShowRegenImageModal(true)}
              className="px-3 py-2 glass border border-border rounded-lg hover:border-white/30 text-xs font-mono uppercase tracking-widest flex items-center gap-2"
              title="Regenerate Image"
            >
              <ImageIcon className="w-3 h-3" />
              Regen Image
            </button>
            <div className="w-px h-6 bg-white/10 mx-2" />
            <button
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="p-2 glass border border-border rounded-lg hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="p-2 glass border border-border rounded-lg hover:border-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowStats(!showStats)}
              className="p-2 glass border border-border rounded-lg hover:border-white/30"
              title="Statistics"
            >
              <BarChart3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleExport}
              className="p-2 glass border border-border rounded-lg hover:border-white/30"
              title="Export as Markdown"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 glass border border-border rounded-lg hover:border-white/30"
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
              <span className={`text-xs ${editedDraft.title.length > 100 ? 'text-[#EAEAEA]' : 'text-muted-foreground'}`}>
                {editedDraft.title.length}/100
              </span>
            </div>
            <input
              type="text"
              value={editedDraft.title}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              maxLength={120}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-lg font-semibold"
            />
          </div>

          {/* Excerpt */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Excerpt</label>
              <span className={`text-xs ${(editedDraft.excerpt?.length || 0) > 200 ? 'text-[#EAEAEA]' : 'text-muted-foreground'}`}>
                {editedDraft.excerpt?.length || 0}/200
              </span>
            </div>
            <textarea
              value={editedDraft.excerpt || ''}
              onChange={(e) => handleFieldChange('excerpt', e.target.value)}
              maxLength={250}
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 resize-none"
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
                    className="px-4 py-2 bg-white/10 text-[#EAEAEA] rounded-lg hover:bg-white/20 border border-white/20"
                  >
                    <X className="w-4 h-4 inline mr-2" />
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* Image Upload Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="flex items-center justify-center px-4 py-3 glass border border-dashed border-border rounded-xl cursor-pointer hover:border-white/30 transition-colors">
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
                  className="flex-1 px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
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
                    className="hover:text-[#EAEAEA]"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              placeholder="Add tag and press Enter"
              className="w-full px-4 py-2 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTagAdd(e.currentTarget.value)
                  e.currentTarget.value = ''
                }
              }}
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
              className="w-full px-4 py-3 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 font-mono text-sm resize-y min-h-[500px]"
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
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-6 py-3 glass border border-border rounded-xl hover:border-white/30 transition-colors"
            >
              Cancel
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSchedule(!showSchedule)}
                className={`px-4 py-3 border border-border rounded-xl transition-colors flex items-center gap-2 ${scheduledDate ? 'bg-white/10 text-white' : 'glass hover:bg-white/5'
                  }`}
              >
                <Calendar className="w-4 h-4" />
                {scheduledDate ? new Date(scheduledDate).toLocaleDateString() : 'Schedule'}
              </button>
              {showSchedule && (
                <div className="absolute bottom-24 left-6 bg-[#050505] border border-white/10 p-4 rounded-xl shadow-xl z-50">
                  <label className="block text-sm mb-2">Publish Date</label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => {
                      setScheduledDate(e.target.value)
                      setHasChanges(true)
                    }}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-white/30 [color-scheme:dark]"
                  />
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => handleSave(false)}
            disabled={!hasChanges}
            className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-[#EAEAEA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </motion.div>

      {/* Modals */}
      <GenerationSettingsModal
        isOpen={showRegenContentModal}
        onClose={() => setShowRegenContentModal(false)}
        onGenerate={handleRegenerateContent}
        mode="text-only"
        title="Regenerate Content"
        initialSettings={{
          topic: editedDraft.metadata?.topic,
          textModel: editedDraft.metadata?.textModel,
          additionalInstructions: editedDraft.metadata?.additionalInstructions
        }}
      />

      <GenerationSettingsModal
        isOpen={showRegenImageModal}
        onClose={() => setShowRegenImageModal(false)}
        onGenerate={handleRegenerateImage}
        mode="image-only"
        title="Regenerate Image"
        initialSettings={{
          imageModel: editedDraft.metadata?.imageModel,
          imageStyle: editedDraft.metadata?.imageStyle,
          imagePrompt: editedDraft.metadata?.imagePrompt
        }}
      />

      {/* Progress modal for image regeneration */}
      <GenerationProgress
        isOpen={isRegeneratingImage}
        isGenerating={isRegeneratingImage}
        progress={progress}
        currentStep={currentStep}
        message={message}
        estimatedTimeRemaining={estimatedTimeRemaining}
        error={regenerationError}
        onCancel={cancelGeneration}
      />
    </motion.div>
  )
}
