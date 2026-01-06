'use client'

import { useState } from 'react'
import { Play, FileText, Clock, ChevronDown, ChevronUp } from 'lucide-react'

interface VideoEmbedProps {
  url: string
  metadata?: {
    video?: {
      platform?: string
      videoId?: string
      embedUrl?: string
      thumbnailUrl?: string
      title?: string
      duration?: string
    }
    transcript?: {
      available: boolean
      wordCount?: number
      videoDuration?: number
      videoDurationFormatted?: string
      reason?: string
    }
  }
  fullContent?: string | null
}

export default function VideoEmbed({ url, metadata, fullContent }: VideoEmbedProps) {
  const [showTranscript, setShowTranscript] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const video = metadata?.video
  const transcript = metadata?.transcript

  // Extract video ID and platform from URL if not in metadata
  const getVideoInfo = () => {
    if (video?.platform && video?.videoId) {
      return { platform: video.platform, videoId: video.videoId }
    }

    // YouTube
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?]+)/)
    if (ytMatch) {
      return { platform: 'youtube', videoId: ytMatch[1] }
    }

    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
    if (vimeoMatch) {
      return { platform: 'vimeo', videoId: vimeoMatch[1] }
    }

    return null
  }

  const videoInfo = getVideoInfo()

  if (!videoInfo) {
    // Not a recognized video platform, just show as external link
    return null
  }

  const getEmbedUrl = () => {
    if (video?.embedUrl) return video.embedUrl

    switch (videoInfo.platform) {
      case 'youtube':
        return `https://www.youtube.com/embed/${videoInfo.videoId}?autoplay=1`
      case 'vimeo':
        return `https://player.vimeo.com/video/${videoInfo.videoId}?autoplay=1`
      default:
        return null
    }
  }

  const getThumbnailUrl = () => {
    if (video?.thumbnailUrl) return video.thumbnailUrl

    switch (videoInfo.platform) {
      case 'youtube':
        return `https://img.youtube.com/vi/${videoInfo.videoId}/maxresdefault.jpg`
      default:
        return null
    }
  }

  const embedUrl = getEmbedUrl()
  const thumbnailUrl = getThumbnailUrl()

  return (
    <div className="space-y-4">
      {/* Video Player */}
      <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black">
        {isPlaying && embedUrl ? (
          <iframe
            src={embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        ) : (
          <div
            className="absolute inset-0 cursor-pointer group"
            onClick={() => setIsPlaying(true)}
          >
            {thumbnailUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={thumbnailUrl}
                alt={video?.title || 'Video thumbnail'}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/30 transition-colors">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all">
                <Play className="w-8 h-8 text-white ml-1" />
              </div>
            </div>
            {/* Duration badge */}
            {(video?.duration || transcript?.videoDurationFormatted) && (
              <div className="absolute bottom-4 right-4 px-3 py-1 bg-black/80 rounded-lg text-sm font-mono text-white flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {video?.duration || transcript?.videoDurationFormatted}
              </div>
            )}
            {/* Platform badge */}
            <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-lg text-xs font-mono uppercase tracking-widest text-white">
              {videoInfo.platform}
            </div>
          </div>
        )}
      </div>

      {/* Transcript Section */}
      {transcript?.available && fullContent && (
        <div className="border border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#888888]" />
              <span className="font-mono text-sm">
                Video Transcript
              </span>
              {transcript.wordCount && (
                <span className="text-xs text-[#888888]">
                  ({transcript.wordCount.toLocaleString()} words)
                </span>
              )}
            </div>
            {showTranscript ? (
              <ChevronUp className="w-5 h-5 text-[#888888]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#888888]" />
            )}
          </button>

          {showTranscript && (
            <div className="p-4 max-h-96 overflow-y-auto border-t border-white/10">
              <p className="text-sm text-[#888888] whitespace-pre-wrap font-mono leading-relaxed">
                {fullContent}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Transcript not available notice */}
      {transcript && !transcript.available && transcript.reason && (
        <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-xs text-[#888888] font-mono">
          <FileText className="w-4 h-4 inline mr-2" />
          {transcript.reason}
        </div>
      )}
    </div>
  )
}
