'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/useAuth'
import { getDraftArticles, publishDraftArticle, deleteDraftArticle, type Article } from '@/lib/articles'
import { FileText, Eye, CheckCircle, Trash2, LogOut, Loader2, AlertCircle } from 'lucide-react'
import ArticleGenerator from '@/components/ArticleGenerator'

export default function AdminDashboard() {
  const { user, loading, logout } = useAuth(true)
  const [drafts, setDrafts] = useState<Article[]>([])
  const [selectedDraft, setSelectedDraft] = useState<Article | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      loadDrafts()
    }
  }, [loading, user])

  const loadDrafts = () => {
    const allDrafts = getDraftArticles()
    setDrafts(allDrafts)
  }

  const handlePublish = async (draftId: string) => {
    setActionLoading(draftId)
    try {
      const published = publishDraftArticle(draftId)
      if (published) {
        loadDrafts()
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
        loadDrafts()
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-6 rounded-2xl border border-border"
          >
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-5 h-5 text-ai-teal dark:text-ai-green" />
              <h3 className="text-sm text-muted-foreground">Draft Articles</h3>
            </div>
            <p className="text-3xl font-bold">{drafts.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass p-6 rounded-2xl border border-border md:col-span-2"
          >
            <h3 className="text-sm text-muted-foreground mb-4">AI Article Generator</h3>
            <ArticleGenerator onArticleGenerated={loadDrafts} />
          </motion.div>
        </div>

        {/* Drafts List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: List of Drafts */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Pending Reviews</h2>
            {drafts.length === 0 ? (
              <div className="glass p-8 rounded-2xl border border-border text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">No drafts available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {drafts.map((draft) => (
                  <motion.div
                    key={draft.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`glass p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedDraft?.id === draft.id
                        ? 'border-ai-teal dark:border-ai-green'
                        : 'border-border hover:border-ai-teal/50 dark:hover:border-ai-green/50'
                    }`}
                    onClick={() => setSelectedDraft(draft)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold mb-1 truncate">{draft.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {draft.excerpt}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          {draft.aiGenerated && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ai-teal/20 dark:bg-ai-green/20 rounded-full text-xs">
                              <div className="w-1.5 h-1.5 bg-ai-teal dark:bg-ai-green rounded-full" />
                              AI Generated
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">{draft.readTime}</span>
                        </div>
                      </div>
                      <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
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
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => router.push(`/thoughts/${selectedDraft.id.replace('draft-', 'article-')}`)}
                    className="flex items-center justify-center gap-2 px-4 py-3 glass border border-border rounded-xl hover:border-ai-teal/50 dark:hover:border-ai-green/50 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                    Full Preview
                  </button>

                  <button
                    onClick={() => handlePublish(selectedDraft.id)}
                    disabled={actionLoading === selectedDraft.id}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-ai-teal to-ai-cyan dark:from-ai-green dark:to-ai-blue text-white font-semibold rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
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
                    className="flex items-center justify-center gap-2 px-4 py-3 glass border border-red-500/50 rounded-xl hover:bg-red-500/10 transition-all text-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    </div>
  )
}
