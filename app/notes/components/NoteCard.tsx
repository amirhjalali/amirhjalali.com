'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Link as LinkIcon, FileText, Image, Video, Trash2, Clock } from 'lucide-react'
import type { Note, NoteType, ProcessStatus } from '@/lib/types'
import { apiClient } from '@/lib/api-client'
import { formatDistanceToNow } from 'date-fns'
import ProcessingIndicator from './ProcessingIndicator'

const typeIcons: Record<NoteType, typeof LinkIcon> = {
  LINK: LinkIcon,
  TEXT: FileText,
  IMAGE: Image,
  VIDEO: Video,
}

export default function NoteCard({ note, onDelete }: { note: Note; onDelete?: () => void }) {
  const Icon = typeIcons[note.type]
  const [status, setStatus] = useState<ProcessStatus>(note.processStatus)
  const [jobId, setJobId] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this note?')) return

    try {
      await apiClient.deleteNote(note.id)
      onDelete?.()
    } catch (_error) {
      alert('Failed to delete note')
    }
  }

  const handleRetry = async () => {
    try {
      const result = await apiClient.processNote(note.id)
      setJobId(result.jobId)
      setStatus('PENDING')
    } catch (_error) {
      alert('Failed to retry processing')
    }
  }

  return (
    <div className="glass p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md hover:border-white/20 transition-all">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#888888]" />
          <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
            {note.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ProcessingIndicator
            status={status}
            jobId={jobId}
            onRetry={handleRetry}
            onStatusChange={setStatus}
          />
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-500/20 rounded-lg transition-colors"
            disabled={status === 'PROCESSING'}
          >
            <Trash2 className="w-4 h-4 text-red-400" />
          </button>
        </div>
      </div>

      <Link href={`/notes/${note.id}`} className="block">
        {note.imageUrl && (
          <div className="relative w-full aspect-video mb-3 rounded-xl overflow-hidden border border-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={note.imageUrl}
              alt={note.title || 'Note image'}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {note.title && (
          <h3 className="text-base font-medium mb-2 line-clamp-2 hover:text-white transition-colors">
            {note.title}
          </h3>
        )}

        <p className="text-sm text-[#888888] line-clamp-3 mb-3 font-mono">
          {note.excerpt || note.content}
        </p>

        {note.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {note.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-md text-xs font-mono"
              >
                {tag}
              </span>
            ))}
            {note.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs font-mono text-[#888888]">
                +{note.tags.length - 3} more
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-[#888888] font-mono">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
        </div>
      </Link>
    </div>
  )
}
