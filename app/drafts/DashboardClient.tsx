'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { logout } from '@/app/actions/auth'
import { apiClient, type Article, type Draft } from '@/lib/api-client'
import {
  FileText,
  Eye,
  CheckCircle,
  Trash2,
  LogOut,
  Loader2,
  Edit,
  Copy,
  Search,
  Upload,
  CheckSquare,
  Square,
  PenLine
} from 'lucide-react'
import DraftEditor from '@/components/DraftEditor'
import BulkPublishProgress from '@/components/BulkPublishProgress'
import GenerationSettingsModal from '@/components/GenerationSettingsModal'
import GenerationProgress from '@/components/GenerationProgress'
import EvalDashboard from '@/components/admin/EvalDashboard'
import { useGenerationProgress } from '@/hooks/useGenerationProgress'
import { AIMetadata } from '@/lib/types'
import { FlaskConical } from 'lucide-react'

interface DashboardClientProps {
  user: { authenticated: boolean; loginTime: number } | null
}

export default function AdminDashboard(_props: DashboardClientProps) {
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([])
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null)
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showGenerationModal, setShowGenerationModal] = useState(false)

  // Progress tracking for article generation
  const {
    isGenerating,
    progress,
    currentStep,
    message,
    estimatedTimeRemaining,
    error,
    result,
    startGeneration,
    cancelGeneration,
  } = useGenerationProgress()
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [_sortBy, _setSortBy] = useState<'date' | 'title'>('date')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [activeView, setActiveView] = useState<'drafts' | 'published' | 'evals'>('drafts')
  const [refreshing, setRefreshing] = useState(false)
  const [bulkPublishState, setBulkPublishState] = useState<{
    isPublishing: boolean
    currentIndex: number
    total: number
    results: { id: string; title?: string; success: boolean; error?: string }[]
  } | null>(null)
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  const loadData = async () => {
    try {
      const [fetchedDrafts, fetchedArticles] = await Promise.all([
        apiClient.getDrafts(),
        apiClient.getArticles()
      ])
      setDrafts(fetchedDrafts)
      setPublishedArticles(fetchedArticles)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  // Filtered and sorted drafts
  const filteredDrafts = useMemo(() => {
    let filtered = drafts.filter(draft =>
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (draft.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    if (_sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    }

    return filtered
  }, [drafts, searchQuery, _sortBy])

  // Sorted published articles (by date, most recent first) - only show actually published ones
  const sortedPublishedArticles = useMemo(() => {
    return [...publishedArticles]
      .filter(a => a.published) // Only show published articles
      .sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt || Date.now()).getTime()
        const dateB = new Date(b.publishedAt || b.createdAt || Date.now()).getTime()
        return dateB - dateA
      })
  }, [publishedArticles])

  const handleGenerateArticle = async (settings: AIMetadata) => {
    await startGeneration('/api/generate-article?stream=true', settings)
  }

  // Reload data when generation completes successfully
  useEffect(() => {
    if (result && !isGenerating && !error) {
      loadData().then(() => {
        if (result.draft) {
          setSelectedDraft(result.draft)
        }
      })
    }
  }, [result, isGenerating, error])

  const handlePublish = async (draftId: string) => {
    setActionLoading(draftId)
    try {
      await apiClient.publishDraft(draftId)
      await loadData()
      setSelectedDraft(null)
    } catch (error) {
      console.error('Error publishing draft:', error)
      alert('Failed to publish draft. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDelete = async (draftId: string) => {
    if (!confirm('Are you sure you want to delete this draft? This action cannot be undone.')) {
      return
    }

    setActionLoading(draftId)
    try {
      await apiClient.deleteDraft(draftId)
      await loadData()
      if (selectedDraft?.id === draftId) {
        setSelectedDraft(null)
      }
    } catch (error) {
      console.error('Error deleting draft:', error)
      alert('Failed to delete draft. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDuplicate = async (draftId: string) => {
    setActionLoading(draftId)
    try {
      const draft = await apiClient.getDraft(draftId)
      const duplicated = await apiClient.createDraft({
        ...draft,
        title: `${draft.title} (Copy)`,
      })
      await loadData()
      setSelectedDraft(duplicated)
    } catch (error) {
      console.error('Error duplicating draft:', error)
      alert('Failed to duplicate draft. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const _handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} drafts? This cannot be undone.`)) return

    try {
      await apiClient.bulkDeleteDrafts(Array.from(selectedIds))
      setSelectedIds(new Set())
      await loadData()
    } catch (error) {
      console.error('Error bulk deleting drafts:', error)
      alert('Failed to delete some drafts. Please try again.')
    }
  }

  const _handleBulkPublish = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Publish ${selectedIds.size} drafts?`)) return

    const draftIds = Array.from(selectedIds)
    const total = draftIds.length

    // Initialize progress state
    setBulkPublishState({
      isPublishing: true,
      currentIndex: 0,
      total,
      results: [],
    })

    const results: { id: string; title?: string; success: boolean; error?: string }[] = []

    // Publish drafts sequentially with progress tracking
    for (let i = 0; i < draftIds.length; i++) {
      const draftId = draftIds[i]
      const draft = drafts.find(d => d.id === draftId)

      setBulkPublishState(prev => ({
        ...prev!,
        currentIndex: i,
      }))

      try {
        await apiClient.publishDraft(draftId)
        results.push({
          id: draftId,
          title: draft?.title,
          success: true,
        })
      } catch (error: any) {
        results.push({
          id: draftId,
          title: draft?.title,
          success: false,
          error: error.message || 'Unknown error',
        })
      }

      // Update results after each operation
      setBulkPublishState(prev => ({
        ...prev!,
        results: [...results],
      }))

      // Small delay between operations to prevent rate limiting
      if (i < draftIds.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // Mark as complete
    setBulkPublishState(prev => ({
      ...prev!,
      isPublishing: false,
    }))

    // Clear selection and reload data
    setSelectedIds(new Set())
    await loadData()
  }

  const toggleSelection = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredDrafts.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredDrafts.map(d => d.id)))
    }
  }

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (event) => {
      const content = event.target?.result as string
      const lines = content.split('\n')
      const title = lines[0].replace(/^#\s*/, '') || 'Untitled Import'
      const excerpt = lines[2] || ''
      const articleContent = lines.slice(4).join('\n') || content

      try {
        await apiClient.createDraft({
          title,
          excerpt,
          content: articleContent,
          tags: ['Imported'],
          aiGenerated: false
        })
        await loadData()
      } catch (error) {
        console.error('Error importing draft:', error)
        alert('Failed to import draft.')
      }
    }
    reader.readAsText(file)
  }

  const handleUnpublish = async (articleId: string) => {
    if (!confirm('Move this article back to drafts?')) return

    try {
      await apiClient.publishArticle(articleId, false)
      await loadData()
      setActiveView('drafts') // Switch to drafts tab to show the moved article
    } catch (error) {
      console.error('Error unpublishing article:', error)
      alert('Failed to unpublish article. Please try again.')
    }
  }

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      {/* Background effects */}
      <div className="noise-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-[#050505] to-[#050505]" />

      {/* Fixed Header - Consistent with main site */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo/Home Link */}
          <Link href="/" className="group">
            <h2 className="text-xl font-serif font-light tracking-tight text-[#EAEAEA] hover:text-white transition-colors">
              Amir H. Jalali
            </h2>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowGenerationModal(true)}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-mono uppercase tracking-wider hidden sm:inline">Generating</span>
                </>
              ) : (
                <>
                  <PenLine className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-wider hidden sm:inline">Generate</span>
                </>
              )}
            </button>
            <button
              onClick={() => logout()}
              className="p-2 hover:bg-white/5 rounded-full transition-colors text-[#888888] hover:text-white"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 px-6 pt-32 pb-16 max-w-7xl mx-auto">
        {/* Minimal Page Title */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-serif font-light tracking-tight mb-3">
            Dashboard
          </h1>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-[#666666]">
            Drafts Manager
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl border transition-all cursor-pointer ${activeView === 'drafts' ? 'bg-white/5 border-white/20' : 'bg-transparent border-white/10 hover:border-white/20'}`}
            onClick={() => setActiveView('drafts')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#888888]">Drafts</h3>
              <FileText className="w-4 h-4 text-[#888888]" />
            </div>
            <p className="text-4xl font-serif font-light">{drafts.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className={`p-6 rounded-xl border transition-all cursor-pointer ${activeView === 'published' ? 'bg-white/5 border-white/20' : 'bg-transparent border-white/10 hover:border-white/20'}`}
            onClick={() => setActiveView('published')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#888888]">Published</h3>
              <CheckCircle className="w-4 h-4 text-[#888888]" />
            </div>
            <p className="text-4xl font-serif font-light">{sortedPublishedArticles.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-xl border transition-all cursor-pointer ${activeView === 'evals' ? 'bg-white/5 border-white/20' : 'bg-transparent border-white/10 hover:border-white/20'}`}
            onClick={() => setActiveView('evals')}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-mono text-xs uppercase tracking-widest text-[#888888]">Evals</h3>
              <FlaskConical className="w-4 h-4 text-[#888888]" />
            </div>
            <p className="text-4xl font-serif font-light">A/B</p>
          </motion.div>
        </div>

        {/* Toolbar */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#888888]" />
            <input
              type="text"
              placeholder="Search..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-transparent border border-white/10 rounded-lg focus:outline-none focus:border-white/30 text-sm font-mono placeholder:text-[#888888]"
            />
          </div>

          <div className="flex gap-2">
            <label className="px-4 py-2 border border-white/10 rounded-lg cursor-pointer hover:bg-white/5 transition-colors text-xs font-mono uppercase tracking-widest flex items-center gap-2 text-[#888888] hover:text-white">
              <Upload className="w-3 h-3" />
              Import
              <input type="file" accept=".md,.markdown" onChange={handleImport} className="hidden" />
            </label>

            <button
              onClick={async () => {
                setRefreshing(true)
                await loadData()
                setRefreshing(false)
              }}
              disabled={refreshing}
              className="px-4 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors text-xs font-mono uppercase tracking-widest flex items-center gap-2 text-[#888888] hover:text-white disabled:opacity-50"
            >
              <Loader2 className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        {activeView === 'evals' ? (
          /* Evals View */
          <EvalDashboard />
        ) : activeView === 'drafts' ? (
          /* Drafts View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* List */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-serif text-xl font-light">Drafts</h2>
                {filteredDrafts.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="text-xs font-mono uppercase tracking-widest text-[#888888] hover:text-white"
                  >
                    {selectedIds.size === filteredDrafts.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              {/* Bulk Actions Bar */}
              {selectedIds.size > 0 && activeView === 'drafts' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between mb-4"
                >
                  <span className="text-sm font-mono">
                    {selectedIds.size} draft{selectedIds.size > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={_handleBulkPublish}
                      className="px-4 py-2 bg-white text-black hover:bg-[#EAEAEA] rounded-lg transition-all font-mono text-xs uppercase tracking-widest font-medium flex items-center gap-2"
                    >
                      <Upload className="w-3 h-3" />
                      Publish
                    </button>
                    <button
                      onClick={_handleBulkDelete}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all font-mono text-xs uppercase tracking-widest text-[#888888] hover:text-white flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                    <button
                      onClick={() => setSelectedIds(new Set())}
                      className="px-4 py-2 bg-transparent hover:bg-white/5 border border-white/10 rounded-lg transition-all font-mono text-xs uppercase tracking-widest text-[#888888] hover:text-white"
                    >
                      Clear
                    </button>
                  </div>
                </motion.div>
              )}

              {filteredDrafts.length === 0 ? (
                <div className="p-12 border border-white/10 rounded-xl text-center">
                  <p className="font-mono text-xs uppercase tracking-widest text-[#888888]">No drafts found</p>
                </div>
              ) : (
                filteredDrafts.map((draft) => (
                  <motion.div
                    key={draft.id}
                    layoutId={draft.id}
                    onClick={() => setSelectedDraft(draft)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all group ${selectedDraft?.id === draft.id
                      ? 'bg-white/10 border-white/30'
                      : 'bg-transparent border-white/10 hover:border-white/20'
                      }`}
                  >
                    <div className="flex items-start gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSelection(draft.id)
                        }}
                        className="mt-1 text-[#888888] hover:text-white transition-colors"
                      >
                        {selectedIds.has(draft.id) ? (
                          <CheckSquare className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg mb-1 truncate group-hover:text-white transition-colors">
                          {draft.title}
                        </h3>
                        <p className="text-sm text-[#888888] line-clamp-2 font-light mb-3">
                          {draft.excerpt}
                        </p>
                        <div className="flex items-center gap-3">
                          {draft.aiGenerated && (
                            <span className="px-2 py-0.5 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                              AI
                            </span>
                          )}
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                            {new Date(draft.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Preview */}
            <div className="lg:sticky lg:top-6 h-fit">
              {selectedDraft ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
                >
                  <div className="mb-8">
                    <h2 className="font-serif text-3xl font-light mb-4">{selectedDraft.title}</h2>
                    <p className="text-[#888888] font-light italic mb-6">{selectedDraft.excerpt}</p>
                    {selectedDraft.imageUrl && (
                      <img
                        src={selectedDraft.imageUrl}
                        alt={selectedDraft.title}
                        className="w-full h-48 object-cover rounded-lg mb-6 border border-white/10"
                      />
                    )}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {selectedDraft.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setEditingDraft(selectedDraft)}
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-widest"
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDuplicate(selectedDraft.id)}
                      className="flex items-center justify-center gap-2 px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-widest"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                    <button
                      onClick={() => router.push(`/thoughts/${selectedDraft.id}`)}
                      className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-colors font-mono text-xs uppercase tracking-widest"
                    >
                      <Eye className="w-3 h-3" />
                      Preview
                    </button>
                    <button
                      onClick={() => handlePublish(selectedDraft.id)}
                      disabled={!!actionLoading}
                      className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-lg hover:bg-[#EAEAEA] transition-colors font-mono text-xs uppercase tracking-widest font-bold"
                    >
                      {actionLoading === selectedDraft.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      Publish
                    </button>
                    <button
                      onClick={() => handleDelete(selectedDraft.id)}
                      className="col-span-2 flex items-center justify-center gap-2 px-4 py-3 border border-white/10 text-[#888888] rounded-lg hover:bg-white/5 hover:text-[#EAEAEA] hover:border-white/20 transition-colors font-mono text-xs uppercase tracking-widest"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="p-12 border border-white/10 rounded-xl text-center flex flex-col items-center justify-center h-full min-h-[400px]">
                  <p className="font-mono text-xs uppercase tracking-widest text-[#888888]">Select a draft to preview</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Published View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedPublishedArticles.map((article) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all bg-white/5 backdrop-blur-sm group"
              >
                <h3 className="font-serif text-xl mb-2 line-clamp-2 group-hover:text-white transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-[#888888] line-clamp-2 font-light mb-4">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                    {new Date(article.publishedAt || article.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingArticle(article)}
                      className="p-2 hover:text-white transition-colors text-[#888888]"
                      title="Edit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => router.push(`/thoughts/${article.id}`)}
                      className="p-2 hover:text-white transition-colors text-[#888888]"
                      title="View"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUnpublish(article.id)}
                      className="p-2 hover:text-[#EAEAEA] transition-colors text-[#888888]"
                      title="Unpublish"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Modal */}
      <AnimatePresence>
        {editingDraft && (
          <DraftEditor
            draft={editingDraft}
            type="draft"
            onSave={async () => {
              await loadData()
              setEditingDraft(null)
              if (selectedDraft?.id === editingDraft.id) {
                setSelectedDraft(drafts.find(d => d.id === editingDraft.id) || null)
              }
            }}
            onClose={() => setEditingDraft(null)}
          />
        )}
        {editingArticle && (
          <DraftEditor
            draft={editingArticle}
            type="article"
            onSave={async () => {
              await loadData()
              setEditingArticle(null)
            }}
            onClose={() => setEditingArticle(null)}
          />
        )}
      </AnimatePresence>

      {/* Generation Settings Modal */}
      <GenerationSettingsModal
        isOpen={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
        onGenerate={handleGenerateArticle}
      />

      {/* Bulk Publish Progress Modal */}
      {bulkPublishState && (
        <BulkPublishProgress
          isOpen={true}
          isPublishing={bulkPublishState.isPublishing}
          currentIndex={bulkPublishState.currentIndex}
          total={bulkPublishState.total}
          results={bulkPublishState.results}
          onClose={() => setBulkPublishState(null)}
        />
      )}

      {/* Article Generation Progress Modal */}
      <GenerationProgress
        isOpen={isGenerating || !!result || !!error}
        progress={progress}
        currentStep={currentStep}
        message={message}
        estimatedTimeRemaining={estimatedTimeRemaining}
        error={error}
        isGenerating={isGenerating}
        onCancel={cancelGeneration}
        onClose={() => {
          // Reset state when closing
          if (!isGenerating) {
            window.location.reload() // Simple reload to clear state
          }
        }}
      />
    </div>
  )
}
