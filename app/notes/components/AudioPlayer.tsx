'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Headphones,
  SkipBack,
  SkipForward,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import type { TranscriptSegment } from '@/lib/types'

interface AudioPlayerProps {
  src: string
  title?: string
  duration?: number // seconds
  transcriptSegments?: TranscriptSegment[]
  thumbnailUrl?: string
  className?: string
}

// Format seconds to MM:SS or HH:MM:SS
function formatTime(seconds: number): string {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function AudioPlayer({
  src,
  title,
  duration,
  transcriptSegments,
  thumbnailUrl,
  className = '',
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [totalDuration, setTotalDuration] = useState(duration || 0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showTranscript, setShowTranscript] = useState(false)
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(-1)

  // Update current time
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)

      // Find active transcript segment
      if (transcriptSegments) {
        const currentMs = audio.currentTime * 1000
        const index = transcriptSegments.findIndex(
          (seg, i) => {
            const nextSeg = transcriptSegments[i + 1]
            const endMs = seg.endMs ?? (nextSeg?.startMs ?? Infinity)
            return currentMs >= seg.startMs && currentMs < endMs
          }
        )
        setActiveSegmentIndex(index)
      }
    }

    const handleLoadedMetadata = () => {
      setTotalDuration(audio.duration)
    }

    const handleEnded = () => {
      setIsPlaying(false)
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [transcriptSegments])

  // Play/pause
  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  // Seek
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    const progress = progressRef.current
    if (!audio || !progress) return

    const rect = progress.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    audio.currentTime = percentage * totalDuration
  }, [totalDuration])

  // Skip forward/backward
  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = Math.max(0, Math.min(totalDuration, audio.currentTime + seconds))
  }, [totalDuration])

  // Volume
  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isMuted) {
      audio.volume = volume
      setIsMuted(false)
    } else {
      audio.volume = 0
      setIsMuted(true)
    }
  }, [isMuted, volume])

  // Jump to transcript segment
  const jumpToSegment = useCallback((segment: TranscriptSegment) => {
    const audio = audioRef.current
    if (!audio) return

    audio.currentTime = segment.startMs / 1000
    if (!isPlaying) {
      audio.play()
      setIsPlaying(true)
    }
  }, [isPlaying])

  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  return (
    <div className={`rounded-xl border border-white/10 bg-white/5 overflow-hidden ${className}`}>
      {/* Audio element */}
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Main player */}
      <div className="p-4">
        {/* Header with thumbnail and title */}
        <div className="flex items-center gap-4 mb-4">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt=""
              className="w-16 h-16 rounded-lg object-cover border border-white/10"
            />
          ) : (
            <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
              <Headphones className="w-6 h-6 text-[#888888]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className="font-medium text-sm truncate mb-1">{title}</h3>
            )}
            <div className="text-xs text-[#888888] font-mono">
              {formatTime(currentTime)} / {formatTime(totalDuration)}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div
          ref={progressRef}
          className="h-2 bg-white/10 rounded-full cursor-pointer group mb-4"
          onClick={handleProgressClick}
        >
          <div
            className="h-full bg-white rounded-full relative transition-all"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md" />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Skip back */}
            <button
              onClick={() => skip(-15)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Skip back 15s"
            >
              <SkipBack className="w-4 h-4 text-[#888888]" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="p-3 bg-white text-black rounded-full hover:bg-[#EAEAEA] transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5" />
              ) : (
                <Play className="w-5 h-5 ml-0.5" />
              )}
            </button>

            {/* Skip forward */}
            <button
              onClick={() => skip(30)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Skip forward 30s"
            >
              <SkipForward className="w-4 h-4 text-[#888888]" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Volume */}
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-[#888888]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#888888]" />
              )}
            </button>

            {/* Transcript toggle */}
            {transcriptSegments && transcriptSegments.length > 0 && (
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className={`p-2 rounded-lg transition-colors ${
                  showTranscript ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
                title={showTranscript ? 'Hide transcript' : 'Show transcript'}
              >
                {showTranscript ? (
                  <Minimize2 className="w-4 h-4 text-[#EAEAEA]" />
                ) : (
                  <Maximize2 className="w-4 h-4 text-[#888888]" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transcript panel */}
      {showTranscript && transcriptSegments && transcriptSegments.length > 0 && (
        <div className="border-t border-white/10 max-h-64 overflow-y-auto">
          <div className="p-4 space-y-2">
            {transcriptSegments.map((segment, index) => (
              <button
                key={index}
                onClick={() => jumpToSegment(segment)}
                className={`w-full text-left p-2 rounded-lg transition-colors ${
                  index === activeSegmentIndex
                    ? 'bg-white/10 border border-white/20'
                    : 'hover:bg-white/5'
                }`}
              >
                <span className="text-xs text-[#888888] font-mono mr-2">
                  {formatTime(segment.startMs / 1000)}
                </span>
                <span className={`text-sm ${index === activeSegmentIndex ? 'text-[#EAEAEA]' : 'text-[#888888]'}`}>
                  {segment.text}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
