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
  Play,
  Heart,
  MessageCircle,
  Repeat2,
  Eye,
  Github,
  Twitter,
  Youtube,
  Users,
  GitFork,
  CheckCircle2
} from 'lucide-react'
import type { Note, NoteType, ProcessStatus, Platform, AuthorInfo, EngagementMetrics } from '@/lib/types'
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

// Platform icons and colors
const platformConfig: Record<Platform | 'default', { icon: typeof LinkIcon; label: string }> = {
  twitter: { icon: Twitter, label: 'X' },
  youtube: { icon: Youtube, label: 'YouTube' },
  linkedin: { icon: Users, label: 'LinkedIn' },
  reddit: { icon: MessageCircle, label: 'Reddit' },
  medium: { icon: FileText, label: 'Medium' },
  substack: { icon: FileText, label: 'Substack' },
  github: { icon: Github, label: 'GitHub' },
  news: { icon: FileText, label: 'News' },
  generic: { icon: LinkIcon, label: 'Link' },
  default: { icon: LinkIcon, label: 'Link' },
}

// Sentiment styling and icons
const sentimentConfig: Record<string, { style: string; icon: string }> = {
  positive: { style: 'bg-white/10 text-[#EAEAEA] border border-white/20', icon: '↑' },
  negative: { style: 'bg-white/5 text-[#888888] border border-white/10', icon: '↓' },
  neutral: { style: 'bg-white/5 text-[#888888] border border-white/10', icon: '→' },
  mixed: { style: 'bg-white/5 text-[#888888] border border-white/10', icon: '↔' },
}

// Format large numbers compactly
function formatNumber(num: number | undefined): string {
  if (num === undefined || num === null) return ''
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
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
    platform?: Platform | null
    thumbnailUrl?: string | null
    author?: AuthorInfo | null
    engagement?: EngagementMetrics | null
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
  const metadata = note.metadata as any

  // Get platform config
  const platform = note.platform || 'default'
  const platformInfo = platformConfig[platform] || platformConfig.default
  const PlatformIcon = platformInfo.icon

  // Get author info
  const author = note.author as AuthorInfo | undefined
  const engagement = note.engagement as EngagementMetrics | undefined

  // Determine the best image to display
  const getImageUrl = () => {
    // For IMAGE type notes, use imageUrl or content (if it's a URL)
    if (note.type === 'IMAGE') {
      if (note.imageUrl) return note.imageUrl
      // Check if content is a URL (uploaded image)
      if (note.content?.startsWith('http')) return note.content
    }
    // Check enrichment thumbnail first
    if (note.thumbnailUrl) return note.thumbnailUrl
    // For videos, prefer video thumbnail
    if (metadata?.video?.thumbnailUrl) return metadata.video.thumbnailUrl
    // Then check standard image sources
    if (note.imageUrl) return note.imageUrl
    if (metadata?.image) return metadata.image
    if (metadata?.ogImage) return metadata.ogImage
    return null
  }

  const imageUrl = getImageUrl()
  const hasImage = !!imageUrl

  // Check if this is a YouTube video with transcript
  const hasTranscript = metadata?.transcript?.available === true
  const videoDuration = metadata?.video?.duration || metadata?.transcript?.videoDurationFormatted

  // Compact card for list view - now with enrichment data
  if (compact) {
    return (
      <Link
        href={`/notes/${note.id}`}
        className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Thumbnail or Author Avatar or Platform Icon */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 overflow-hidden">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="w-full h-full object-cover" />
          ) : author?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={author.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : note.favicon ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={note.favicon} alt="" className="w-6 h-6" />
          ) : (
            <PlatformIcon className="w-5 h-5 text-[#888888]" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className="text-sm font-medium truncate group-hover:text-white transition-colors">
            {note.title || note.excerpt?.substring(0, 50) || 'Untitled'}
          </h3>

          {/* Author + Source Row */}
          <div className="flex items-center gap-2 mt-0.5">
            {author?.name && (
              <span className="flex items-center gap-1 text-xs text-[#EAEAEA]">
                {author.verified && <CheckCircle2 className="w-3 h-3" />}
                {author.name}
                {author.handle && <span className="text-[#888888]">@{author.handle}</span>}
              </span>
            )}
            {!author?.name && note.domain && (
              <span className="text-xs text-[#888888] truncate">{note.domain}</span>
            )}
            {note.platform && note.platform !== 'generic' && (
              <span className="flex items-center gap-1 text-xs text-[#888888]">
                <PlatformIcon className="w-3 h-3" />
              </span>
            )}
          </div>

          {/* Excerpt + Tags Row */}
          <div className="flex items-center gap-2 mt-1">
            {note.excerpt && (
              <span className="text-xs text-[#888888] truncate max-w-[200px]">
                {note.excerpt.substring(0, 60)}...
              </span>
            )}
            {note.tags && note.tags.length > 0 && (
              <div className="hidden sm:flex items-center gap-1">
                {note.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-[#888888]">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Engagement Metrics */}
        {engagement && (
          <div className="hidden md:flex items-center gap-3 text-xs text-[#888888]">
            {engagement.likes !== undefined && (
              <span className="flex items-center gap-1">
                <Heart className="w-3 h-3" />
                {formatNumber(engagement.likes)}
              </span>
            )}
            {engagement.retweets !== undefined && (
              <span className="flex items-center gap-1">
                <Repeat2 className="w-3 h-3" />
                {formatNumber(engagement.retweets)}
              </span>
            )}
            {engagement.comments !== undefined && (
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {formatNumber(engagement.comments)}
              </span>
            )}
            {engagement.views !== undefined && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatNumber(engagement.views)}
              </span>
            )}
            {/* GitHub specific */}
            {engagement.stars !== undefined && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {formatNumber(engagement.stars)}
              </span>
            )}
            {engagement.forks !== undefined && (
              <span className="flex items-center gap-1">
                <GitFork className="w-3 h-3" />
                {formatNumber(engagement.forks)}
              </span>
            )}
          </div>
        )}

        {/* Status & Actions */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#888888] hidden sm:inline">
            {formatDistanceToNow(new Date(note.createdAt), { addSuffix: false })}
          </span>
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
          {/* Video duration badge */}
          {videoDuration && (
            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 rounded text-xs font-mono text-white">
              {videoDuration}
            </div>
          )}
          {/* Transcript available badge */}
          {hasTranscript && (
            <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-xs font-mono text-white flex items-center gap-1">
              <FileText className="w-3 h-3" />
              Transcript
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
            {/* Platform icon */}
            <PlatformIcon className="flex-shrink-0 w-4 h-4 text-[#888888]" />
            {/* Source info */}
            {note.domain ? (
              <span className="text-xs font-mono text-[#888888] truncate">{note.domain}</span>
            ) : (
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
                {platformInfo.label}
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

        {/* Author Info */}
        {author && (author.name || author.handle) && (
          <div className="flex items-center gap-2 mb-3">
            {author.avatarUrl && (
              <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={author.avatarUrl} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs">
              {author.verified && <CheckCircle2 className="w-3 h-3 text-[#EAEAEA]" />}
              <span className="text-[#EAEAEA] font-medium">{author.name}</span>
              {author.handle && (
                <span className="text-[#888888]">@{author.handle}</span>
              )}
            </div>
          </div>
        )}

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

          {/* Engagement Metrics */}
          {engagement && (
            <div className="flex items-center gap-3 text-xs text-[#888888] mb-3">
              {engagement.likes !== undefined && (
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {formatNumber(engagement.likes)}
                </span>
              )}
              {engagement.retweets !== undefined && (
                <span className="flex items-center gap-1">
                  <Repeat2 className="w-3 h-3" />
                  {formatNumber(engagement.retweets)}
                </span>
              )}
              {engagement.comments !== undefined && (
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  {formatNumber(engagement.comments)}
                </span>
              )}
              {engagement.views !== undefined && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {formatNumber(engagement.views)}
                </span>
              )}
              {engagement.stars !== undefined && (
                <span className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {formatNumber(engagement.stars)}
                </span>
              )}
              {engagement.forks !== undefined && (
                <span className="flex items-center gap-1">
                  <GitFork className="w-3 h-3" />
                  {formatNumber(engagement.forks)}
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
            {note.sentiment && sentimentConfig[note.sentiment] && (
              <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${sentimentConfig[note.sentiment].style}`}>
                {sentimentConfig[note.sentiment].icon} {note.sentiment}
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
