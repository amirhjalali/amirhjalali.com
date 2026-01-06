'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import type { Note } from '@/lib/types'
import { Link as LinkIcon, FileText, Image, Video, FileType2, File, ArrowLeft, Trash2, Edit3, Save, X, RefreshCw, Loader2, ExternalLink, Clock, Brain, Youtube } from 'lucide-react'
import VideoEmbed from '../components/VideoEmbed'
import { formatDistanceToNow } from 'date-fns'
import type { NoteType, ProcessStatus } from '@/lib/types'

const typeIcons: Record<NoteType, typeof LinkIcon> = {
  LINK: LinkIcon,
  TEXT: FileText,
  IMAGE: Image,
  VIDEO: Video,
  PDF: FileType2,
  DOCUMENT: File,
}

const statusColors: Record<ProcessStatus, string> = {
  PENDING: 'text-[#888888] bg-white/5 border-white/10',
  PROCESSING: 'text-[#EAEAEA] bg-white/5 border-white/20',
  INDEXED: 'text-[#EAEAEA] bg-white/10 border-white/20',
  COMPLETED: 'text-[#EAEAEA] bg-white/10 border-white/20',
  FAILED: 'text-[#888888] bg-white/5 border-white/10',
}

// Helper to check if URL is a video platform
function isVideoUrl(url: string): boolean {
  if (!url) return false
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com') ||
    url.includes('tiktok.com')
  )
}

export default function NoteDetailClient({ noteId }: { noteId: string }) {
  const router = useRouter()
  const [note, setNote] = useState<Note | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isReprocessing, setIsReprocessing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedContent, setEditedContent] = useState('')
  const [editedTags, setEditedTags] = useState<string[]>([])

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const fetchedNote = await apiClient.getNote(noteId)
        setNote(fetchedNote)
        setEditedTitle(fetchedNote.title || '')
        setEditedContent(fetchedNote.content)
        setEditedTags(fetchedNote.tags)
      } catch (error) {
        console.error('Failed to fetch note:', error)
        router.push('/notes')
      } finally {
        setIsLoading(false)
      }
    }

    fetchNote()
  }, [noteId, router])

  const handleSave = async () => {
    if (!note) return

    try {
      const updated = await apiClient.updateNote(note.id, {
        title: editedTitle || undefined,
        content: editedContent,
        tags: editedTags,
      })
      setNote(updated)
      setIsEditing(false)
    } catch (_error) {
      alert('Failed to update note')
    }
  }

  const handleDelete = async () => {
    if (!note || !confirm('Are you sure you want to delete this note?')) return

    try {
      await apiClient.deleteNote(note.id)
      router.push('/notes')
    } catch (_error) {
      alert('Failed to delete note')
    }
  }

  const handleReprocess = async () => {
    if (!note) return

    setIsReprocessing(true)
    try {
      // Trigger reprocessing via the API
      const response = await fetch(`/api/notes/${note.id}/process`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Reprocess failed')
      }

      // Fetch the updated note
      const updatedNote = await apiClient.getNote(noteId)
      setNote(updatedNote)
    } catch (_error) {
      alert('Failed to reprocess note')
    } finally {
      setIsReprocessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-white/5 border border-white/10 rounded-xl animate-pulse w-32" />
        <div className="h-64 bg-white/5 border border-white/10 rounded-3xl animate-pulse" />
      </div>
    )
  }

  if (!note) {
    return (
      <div className="text-center py-12">
        <p className="text-[#888888]">Note not found</p>
      </div>
    )
  }

  const Icon = typeIcons[note.type]

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#888888] hover:text-white transition-colors font-mono text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Notes
      </button>

      {/* Note Card */}
      <div className="glass p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Icon className="w-6 h-6 text-[#888888]" />
            <span className="text-sm font-mono uppercase tracking-widest text-[#888888]">
              {note.type}
            </span>
            <span className={`px-3 py-1 rounded-lg text-xs font-mono border ${statusColors[note.processStatus]}`}>
              {note.processStatus}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={handleReprocess}
                  disabled={isReprocessing}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                  title="Reprocess with AI"
                >
                  {isReprocessing ? (
                    <Loader2 className="w-5 h-5 text-[#888888] animate-spin" />
                  ) : (
                    <RefreshCw className="w-5 h-5 text-[#888888]" />
                  )}
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Edit note"
                >
                  <Edit3 className="w-5 h-5 text-[#888888]" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Delete note"
                >
                  <Trash2 className="w-5 h-5 text-[#888888] hover:text-[#EAEAEA]" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-[#EAEAEA] transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span className="text-sm font-mono uppercase tracking-widest">Save</span>
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false)
                    setEditedTitle(note.title || '')
                    setEditedContent(note.content)
                    setEditedTags(note.tags)
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/20 rounded-lg text-[#EAEAEA] hover:bg-white/10 transition-all"
                >
                  <X className="w-4 h-4" />
                  <span className="text-sm font-mono uppercase tracking-widest">Cancel</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Video Embed for YouTube/Vimeo links */}
        {note.type === 'LINK' && isVideoUrl(note.content) && (
          <VideoEmbed
            url={note.content}
            metadata={note.metadata as any}
            fullContent={note.fullContent}
          />
        )}

        {/* Image Display */}
        {(note.imageUrl || (note.type === 'IMAGE' && note.content?.startsWith('http'))) && !isVideoUrl(note.content) && (
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={note.imageUrl || note.content}
              alt={note.title || 'Note image'}
              className="w-full h-auto max-h-[600px] object-contain bg-black/50"
            />
          </div>
        )}

        {/* OG Image for articles without dedicated imageUrl */}
        {!note.imageUrl && note.type === 'LINK' && !isVideoUrl(note.content) && (note.metadata as any)?.image && (
          <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={(note.metadata as any).image}
              alt={note.title || 'Article image'}
              className="w-full h-auto max-h-[400px] object-cover"
            />
          </div>
        )}

        {isEditing ? (
          <input
            type="text"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            placeholder="Title (optional)"
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-[#EAEAEA] placeholder:text-[#888888]/50 transition-all text-2xl font-medium"
          />
        ) : note.title ? (
          <h1 className="text-3xl font-medium">{note.title}</h1>
        ) : null}

        {/* Content */}
        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-[#EAEAEA] placeholder:text-[#888888]/50 transition-all font-mono text-sm min-h-[200px]"
          />
        ) : (
          <div className="prose prose-invert max-w-none">
            <p className="text-[#EAEAEA] whitespace-pre-wrap font-mono text-sm">
              {note.content}
            </p>
          </div>
        )}

        {/* Tags */}
        {isEditing ? (
          <div className="space-y-2">
            <label className="text-xs font-mono uppercase tracking-widest text-[#888888]">
              Tags
            </label>
            <input
              type="text"
              value={editedTags.join(', ')}
              onChange={(e) => setEditedTags(e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
              placeholder="tag1, tag2, tag3"
              className="w-full px-4 py-2 bg-black/20 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-[#EAEAEA] placeholder:text-[#888888]/50 transition-all font-mono text-sm"
            />
          </div>
        ) : note.tags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white/10 border border-white/20 rounded-lg text-sm font-mono"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {/* AI Processing Results */}
        {note.processStatus === 'COMPLETED' && (note.summary || note.keyInsights.length > 0 || note.topics.length > 0) && (
          <div className="border-t border-white/10 pt-6 space-y-4">
            <h3 className="text-sm font-mono uppercase tracking-widest text-[#888888]">
              AI Analysis
            </h3>

            {note.summary && (
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-2">
                  Summary
                </h4>
                <p className="text-sm text-[#EAEAEA]">{note.summary}</p>
              </div>
            )}

            {note.keyInsights.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-2">
                  Key Insights
                </h4>
                <ul className="space-y-1">
                  {note.keyInsights.map((insight, i) => (
                    <li key={i} className="text-sm text-[#EAEAEA] flex items-start gap-2">
                      <span className="text-[#888888]">•</span>
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {note.topics.length > 0 && (
              <div>
                <h4 className="text-xs font-mono uppercase tracking-widest text-[#888888] mb-2">
                  Topics
                </h4>
                <div className="flex flex-wrap gap-2">
                  {note.topics.map((topic) => (
                    <span
                      key={topic}
                      className="px-2 py-1 bg-white/5 border border-white/20 rounded-md text-xs font-mono text-[#EAEAEA]"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Source Info */}
        {note.type === 'LINK' && (note.domain || note.sourceUrl) && (
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
            {note.favicon && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={note.favicon}
                alt=""
                className="w-5 h-5 rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none'
                }}
              />
            )}
            <div className="flex-1 min-w-0">
              {note.domain && (
                <span className="text-sm text-[#888888]">{note.domain}</span>
              )}
            </div>
            {note.sourceUrl && (
              <a
                href={note.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-mono text-[#888888] hover:text-[#EAEAEA] hover:bg-white/10 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open Original
              </a>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="border-t border-white/10 pt-4 flex flex-wrap items-center gap-4 text-xs text-[#888888] font-mono">
          {note.readingTime && (
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {note.readingTime} min read
            </span>
          )}
          {note.wordCount && (
            <span>{note.wordCount.toLocaleString()} words</span>
          )}
          <span className="hidden sm:inline">•</span>
          <span>Created {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}</span>
          <span>Updated {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</span>
          {note.processedAt && (
            <span className="flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5" />
              Processed {formatDistanceToNow(new Date(note.processedAt), { addSuffix: true })}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
