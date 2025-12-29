'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Link as LinkIcon,
  FileText,
  Image,
  Video,
  FileType2,
  File,
  Trash2,
  Clock,
  ExternalLink,
  Star,
  Pin,
  BookOpen,
  Play
} from 'lucide-react'
import type { Note, NoteType, ProcessStatus } from '@/lib/types'
import { apiClient } from '@/lib/api-client'
import { formatDistanceToNow } from 'date-fns'
import ProcessingIndicator from './ProcessingIndicator'

const typeIcons: Record<NoteType, typeof LinkIcon> = {
  LINK: LinkIcon,
  TEXT: FileText,
  IMAGE: Image,
  VIDEO: Video,
  PDF: FileType2,
  DOCUMENT: File,
}

const typeLabels: Record<NoteType, string> = {
  LINK: 'Link',
  TEXT: 'Note',
  IMAGE: 'Image',
  VIDEO: 'Video',
  PDF: 'PDF',
  DOCUMENT: 'Document',
}

// Sentiment color mapping (monochrome style)
const sentimentStyles: Record<string, string> = {
  positive: 'bg-white/10 text-[#EAEAEA]',
  negative: 'bg-white/5 text-[#888888]',
  neutral: 'bg-white/5 text-[#888888]',
  mixed: 'bg-white/5 text-[#888888]',
}

interface NoteCardProps {
  note: Note & {
    domain?: string | null
    favicon?: string | null
    wordCount?: number | null
    readingTime?: number | null
    pinned?: boolean
    starred?: boolean
    sourceType?: string | null
  }
  onDelete?: () => void
  compact?: boolean
}

export default function NoteCard({ note, onDelete, compact = false }: NoteCardProps) {
  const Icon = typeIcons[note.type] || FileText
  const [status, setStatus] = useState<ProcessStatus>(note.processStatus)
  const [jobId, setJobId] = useState<string | null>(null)
  const [isHovered, setIsHovered] = useState(false)

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      await apiClient.deleteNote(note.id)
      onDelete?.()
    } catch (_error) {
      alert('Failed to delete note')
    }
  }

  const handleRetry = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      const result = await apiClient.processNote(note.id)
      setJobId(result.jobId)
      setStatus('PENDING')
    } catch (_error) {
      alert('Failed to retry processing')
    }
  }

  const isVideoType = note.type === 'VIDEO' || note.sourceType === 'video'
  const hasImage = note.imageUrl || (note.metadata as any)?.image
  const imageUrl = note.imageUrl || (note.metadata as any)?.image

  // Compact card for list view
  if (compact) {
    return (
      <Link
        href={`/notes/${note.id}`}
        className="flex items-center gap-4 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Favicon or Type Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
          {note.favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={note.favicon} alt="" className="w-5 h-5" />
          ) : (
            <Icon className="w-5 h-5 text-[#888888]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate group-hover:text-white transition-colors">
            {note.title || note.excerpt?.substring(0, 50) || 'Untitled'}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {note.domain && (
              <span className="text-xs text-[#888888] truncate">{note.domain}</span>
            )}
            {note.readingTime && (
              <span className="text-xs text-[#888888]">• {note.readingTime} min</span>
            )}
          </div>
        </div>

        {/* Status & Actions */}
        <div className="flex items-center gap-2">
          <ProcessingIndicator
            status={status}
            jobId={jobId}
            onRetry={handleRetry}
            onStatusChange={setStatus}
            compact
          />
          {isHovered && (
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4 text-[#888888] hover:text-[#EAEAEA]" />
            </button>
          )}
        </div>
      </Link>
    )
  }

  // Full card for grid view
  return (
    <div
      className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 transition-all overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Pinned/Starred badges */}
      {(note.pinned || note.starred) && (
        <div className="absolute top-3 left-3 z-10 flex gap-1.5">
          {note.pinned && (
            <span className="p-1 bg-white/10 backdrop-blur-sm rounded-md">
              <Pin className="w-3 h-3 text-[#EAEAEA]" />
            </span>
          )}
          {note.starred && (
            <span className="p-1 bg-white/10 backdrop-blur-sm rounded-md">
              <Star className="w-3 h-3 text-[#EAEAEA] fill-current" />
            </span>
          )}
        </div>
      )}

      {/* Image/Thumbnail Area */}
      {hasImage && (
        <Link href={`/notes/${note.id}`} className="block relative aspect-video overflow-hidden bg-white/5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={note.title || 'Note thumbnail'}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {/* Video play overlay */}
          {isVideoType && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Play className="w-5 h-5 text-white ml-0.5" />
              </div>
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
        </Link>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Source info */}
            {note.favicon ? (
              <div className="flex-shrink-0 w-5 h-5 rounded overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={note.favicon} alt="" className="w-full h-full object-contain" />
              </div>
            ) : (
              <Icon className="flex-shrink-0 w-4 h-4 text-[#888888]" />
            )}
            {note.domain ? (
              <span className="text-xs font-mono text-[#888888] truncate">{note.domain}</span>
            ) : (
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
                {typeLabels[note.type]}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <ProcessingIndicator
              status={status}
              jobId={jobId}
              onRetry={handleRetry}
              onStatusChange={setStatus}
            />
            <button
              onClick={handleDelete}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              disabled={status === 'PROCESSING'}
            >
              <Trash2 className="w-4 h-4 text-[#888888] hover:text-[#EAEAEA]" />
            </button>
          </div>
        </div>

        <Link href={`/notes/${note.id}`} className="block">
          {/* Title */}
          {note.title && (
            <h3 className="text-base font-medium mb-2 line-clamp-2 group-hover:text-white transition-colors">
              {note.title}
            </h3>
          )}

          {/* Excerpt */}
          <p className="text-sm text-[#888888] line-clamp-3 mb-3">
            {note.excerpt || note.content?.substring(0, 150)}
          </p>

          {/* AI Topics */}
          {note.topics && note.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {note.topics.slice(0, 4).map((topic) => (
                <span
                  key={topic}
                  className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-[#888888]"
                >
                  {topic}
                </span>
              ))}
              {note.topics.length > 4 && (
                <span className="px-2 py-0.5 text-xs text-[#888888]">
                  +{note.topics.length - 4}
                </span>
              )}
            </div>
          )}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {note.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-md text-xs font-mono"
                >
                  #{tag}
                </span>
              ))}
              {note.tags.length > 3 && (
                <span className="px-2 py-0.5 text-xs font-mono text-[#888888]">
                  +{note.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer with metadata */}
          <div className="flex items-center justify-between text-xs text-[#888888] font-mono pt-2 border-t border-white/5">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
              </span>
              {note.readingTime && (
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {note.readingTime} min
                </span>
              )}
            </div>
            {note.sentiment && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${sentimentStyles[note.sentiment] || sentimentStyles.neutral}`}>
                {note.sentiment}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* External link icon for LINK types */}
      {note.type === 'LINK' && note.content && (
        <a
          href={note.content}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 p-1.5 bg-white/10 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/20"
        >
          <ExternalLink className="w-3.5 h-3.5 text-[#EAEAEA]" />
        </a>
      )}
    </div>
  )
}
