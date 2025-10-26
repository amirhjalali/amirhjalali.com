'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import {
  getDraftArticles,
  publishDraftArticle,
  deleteDraftArticle,
  initializeDrafts,
  duplicateDraftArticle,
  bulkDeleteDrafts,
  bulkPublishDrafts,
  getArticles,
  unpublishArticle,
  type Article
} from '@/lib/articles'
import {
  FileText,
  Eye,
  CheckCircle,
  Trash2,
  LogOut,
  Loader2,
  AlertCircle,
  Edit,
  Copy,
  Search,
  Filter,
  Upload,
  CheckSquare,
  Square
} from 'lucide-react'
import DraftEditor from '@/components/DraftEditor'

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth(true)
  const [drafts, setDrafts] = useState<Article[]>([])
  const [publishedArticles, setPublishedArticles] = useState<Article[]>([])
  const [selectedDraft, setSelectedDraft] = useState<Article | null>(null)
  const [editingDraft, setEditingDraft] = useState<Article | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'title'>('date')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [showPublished, setShowPublished] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      initializeDrafts().then(() => {
        loadData()
      })
    }
  }, [loading, user])

  // Debounce search input (300ms delay)
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  const loadData = () => {
    setDrafts(getDraftArticles())
    setPublishedArticles(getArticles())
  }

  // Filtered and sorted drafts
  const filteredDrafts = useMemo(() => {
    let filtered = drafts.filter(draft =>
      draft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      draft.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    if (sortBy === 'title') {
      filtered.sort((a, b) => a.title.localeCompare(b.title))
    } else {
      filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    }

    return filtered
  }, [drafts, searchQuery, sortBy])

  const handlePublish = async (draftId: string) => {
    setActionLoading(draftId)
    try {
      const published = publishDraftArticle(draftId)
      if (published) {
        loadData()
        setSelectedDraft(null)
      }
    } catch (error) {
      console.error('Error publishing draft:', error)
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
      const deleted = deleteDraftArticle(draftId)
      if (deleted) {
        loadData()
        if (selectedDraft?.id === draftId) {
          setSelectedDraft(null)
        }
      }
    } catch (error) {
      console.error('Error deleting draft:', error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleDuplicate = (draftId: string) => {
    setActionLoading(draftId)
    try {
      const duplicated = duplicateDraftArticle(draftId)
      if (duplicated) {
        loadData()
        setSelectedDraft(duplicated)
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} drafts? This cannot be undone.`)) return

    bulkDeleteDrafts(Array.from(selectedIds))
    setSelectedIds(new Set())
    loadData()
  }

  const handleBulkPublish = () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Publish ${selectedIds.size} drafts?`)) return

    bulkPublishDrafts(Array.from(selectedIds))
    setSelectedIds(new Set())
    loadData()
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
    reader.onload = (event) => {
      const content = event.target?.result as string
      // Parse markdown (simple implementation)
      const lines = content.split('\n')
      const title = lines[0].replace(/^#\s*/, '')
      const excerpt = lines[2] || ''
      const articleContent = lines.slice(4).join('\n')

      // Create draft from imported markdown
      // This would use saveDraftArticle with parsed data
      console.log('Import:', { title, excerpt, content: articleContent })
    }
    reader.readAsText(file)
  }

  const handleUnpublish = (articleId: string) => {
    if (!confirm('Move this article back to drafts?')) return

    unpublishArticle(articleId)
    loadData()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-ai-teal dark:text-ai-green" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen relative">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

      <div className="relative z-10 px-6 py-12 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl md:text-5xl font-space mb-2">
              <span className="text-gradient">Admin Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Welcome back, {user.username}
            </p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 glass border border-border rounded-xl hover:border-red-500/50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl border border-border cursor-pointer"
            onClick={() => setShowPublished(false)}
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-ai-teal dark:text-ai-green" />
              <h3 className="text-sm text-muted-foreground">Drafts</h3>
            </div>
            <p className="text-3xl font-bold">{drafts.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass p-6 rounded-2xl border border-border cursor-pointer"
            onClick={() => setShowPublished(true)}
          >
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="text-sm text-muted-foreground">Published</h3>
            </div>
            <p className="text-3xl font-bold">{publishedArticles.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-2xl border border-border md:col-span-2"
          >
            <h3 className="text-sm text-muted-foreground mb-2">AI Article Generator</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Articles are automatically generated daily at 9 AM UTC via GitHub Actions.
            </p>
            <a
              href="https://github.com/amirhjalali/amirhjalali.com/actions/workflows/ai-article-generator.yml"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
              View GitHub Actions
            </a>
          </motion.div>
        </div>

        {/* Toolbar */}
        <div className="glass p-4 rounded-2xl border border-border mb-6">
          <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search drafts..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-teal text-sm"
                />
              </div>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'title')}
              className="px-4 py-2 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ai-teal text-sm"
            >
              <option value="date">Sort by Date</option>
              <option value="title">Sort by Title</option>
            </select>

            {/* Import */}
            <label className="px-4 py-2 glass border border-border rounded-xl cursor-pointer hover:border-ai-teal/50 transition-colors text-sm flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import MD
              <input type="file" accept=".md,.markdown" onChange={handleImport} className="hidden" />
            </label>

            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
              <>
                <button
                  onClick={handleBulkPublish}
                  className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Publish {selectedIds.size}
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete {selectedIds.size}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        {!showPublished ? (
          /* Drafts View */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: List of Drafts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Drafts ({filteredDrafts.length})</h2>
                {filteredDrafts.length > 0 && (
                  <button
                    onClick={toggleSelectAll}
                    className="text-sm text-ai-teal dark:text-ai-green hover:underline flex items-center gap-2"
                  >
                    {selectedIds.size === filteredDrafts.length ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    {selectedIds.size === filteredDrafts.length ? 'Deselect All' : 'Select All'}
                  </button>
                )}
              </div>

              {filteredDrafts.length === 0 ? (
                <div className="glass p-8 rounded-2xl border border-border text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    {searchQuery ? 'No drafts match your search' : 'No drafts available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDrafts.map((draft) => (
                    <motion.div
                      key={draft.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`glass p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedDraft?.id === draft.id
                          ? 'border-ai-teal dark:border-ai-green'
                          : 'border-border hover:border-ai-teal/50 dark:hover:border-ai-green/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleSelection(draft.id)
                          }}
                          className="mt-1 flex-shrink-0"
                        >
                          {selectedIds.has(draft.id) ? (
                            <CheckSquare className="w-5 h-5 text-ai-teal dark:text-ai-green" />
                          ) : (
                            <Square className="w-5 h-5 text-muted-foreground" />
                          )}
                        </button>

                        <div className="flex-1 min-w-0" onClick={() => setSelectedDraft(draft)}>
                          <h3 className="font-semibold mb-1 truncate">{draft.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {draft.excerpt}
                          </p>
                          <div className="flex items-center gap-3 mt-2 flex-wrap">
                            {draft.aiGenerated && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ai-teal/20 dark:bg-ai-green/20 rounded-full text-xs">
                                <div className="w-1.5 h-1.5 bg-ai-teal dark:bg-ai-green rounded-full" />
                                AI Generated
                              </span>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {draft.content.trim().split(/\s+/).length} words
                            </span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{draft.readTime}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Preview & Actions */}
            <div className="lg:sticky lg:top-6 h-fit">
              {selectedDraft ? (
                <motion.div
                  key={selectedDraft.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="glass p-6 rounded-2xl border border-border"
                >
                  <h2 className="text-2xl font-semibold mb-4">Preview</h2>

                  {/* Article Preview */}
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-2">{selectedDraft.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{selectedDraft.excerpt}</p>

                    {selectedDraft.imageUrl && (
                      <img
                        src={selectedDraft.imageUrl}
                        alt={selectedDraft.title}
                        className="w-full h-48 object-cover rounded-xl mb-4"
                      />
                    )}

                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedDraft.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-accent rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="prose prose-sm dark:prose-invert max-h-64 overflow-y-auto">
                      <div
                        dangerouslySetInnerHTML={{
                          __html: selectedDraft.content
                            .replace(/^# /gm, '<h1>')
                            .replace(/\n/g, '</h1><p>')
                            .replace(/^## /gm, '<h2>')
                            .replace(/^### /gm, '<h3>')
                        }}
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setEditingDraft(selectedDraft)}
                      className="flex items-center justify-center gap-2 px-4 py-3 glass border border-border rounded-xl hover:border-ai-teal/50 transition-all"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>

                    <button
                      onClick={() => handleDuplicate(selectedDraft.id)}
                      disabled={actionLoading === selectedDraft.id}
                      className="flex items-center justify-center gap-2 px-4 py-3 glass border border-border rounded-xl hover:border-ai-teal/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {actionLoading === selectedDraft.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                      Duplicate
                    </button>

                    <button
                      onClick={() => router.push(`/thoughts/${selectedDraft.id}`)}
                      className="flex items-center justify-center gap-2 px-4 py-3 glass border border-border rounded-xl hover:border-ai-teal/50 transition-all col-span-2"
                    >
                      <Eye className="w-4 h-4" />
                      Full Preview
                    </button>

                    <button
                      onClick={() => handlePublish(selectedDraft.id)}
                      disabled={actionLoading === selectedDraft.id}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-ai-teal to-ai-cyan dark:from-ai-green dark:to-ai-blue text-white font-semibold rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed col-span-2"
                    >
                      {actionLoading === selectedDraft.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Publish Article
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(selectedDraft.id)}
                      disabled={actionLoading === selectedDraft.id}
                      className="flex items-center justify-center gap-2 px-4 py-3 glass border border-red-500/50 rounded-xl hover:bg-red-500/10 transition-all text-red-500 disabled:opacity-50 col-span-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Draft
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="glass p-12 rounded-2xl border border-border text-center">
                  <Eye className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Select a draft to preview and manage
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Published Articles View */
          <div>
            <h2 className="text-2xl font-semibold mb-4">Published Articles ({publishedArticles.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {publishedArticles.map((article) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass p-4 rounded-xl border border-border hover:border-ai-teal/50 transition-all"
                >
                  <h3 className="font-semibold mb-2 truncate">{article.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {article.excerpt}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/thoughts/${article.id}`)}
                      className="flex-1 px-3 py-2 glass border border-border rounded-lg text-sm hover:border-ai-teal/50"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleUnpublish(article.id)}
                      className="px-3 py-2 glass border border-yellow-500/50 rounded-lg text-sm hover:bg-yellow-500/10 text-yellow-500"
                    >
                      Unpublish
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Draft Editor Modal */}
      <AnimatePresence>
        {editingDraft && (
          <DraftEditor
            draft={editingDraft}
            onSave={() => {
              loadData()
              setEditingDraft(null)
              // Update selectedDraft if it was being edited
              if (selectedDraft?.id === editingDraft.id) {
                setSelectedDraft(getDraftArticles().find(d => d.id === editingDraft.id) || null)
              }
            }}
            onClose={() => setEditingDraft(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
