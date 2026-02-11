'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  Clock,
  FileText,
} from 'lucide-react'
import type { SlideInfo } from '@/lib/types'

interface SlideGalleryProps {
  slides: SlideInfo[]
  videoId?: string
  onSeek?: (timestamp: number) => void
  className?: string
}

// Format seconds to MM:SS
function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export default function SlideGallery({
  slides,
  videoId: _videoId,
  onSeek,
  className = '',
}: SlideGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showOcr, setShowOcr] = useState(false)

  if (!slides || slides.length === 0) {
    return null
  }

  const currentSlide = slides[currentIndex]

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : slides.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < slides.length - 1 ? prev + 1 : 0))
  }

  const handleSeek = () => {
    if (onSeek && currentSlide) {
      onSeek(currentSlide.timestamp)
    }
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <div className={`rounded-xl border border-white/10 bg-white/5 overflow-hidden ${className}`}>
        {/* Header */}
        <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
          <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
            Slides ({slides.length})
          </span>
          <div className="flex items-center gap-2">
            {currentSlide?.ocrText && (
              <button
                onClick={() => setShowOcr(!showOcr)}
                className={`p-1.5 rounded-lg transition-colors ${
                  showOcr ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
                title={showOcr ? 'Hide OCR text' : 'Show OCR text'}
              >
                <FileText className="w-4 h-4 text-[#888888]" />
              </button>
            )}
            <button
              onClick={openModal}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              title="View fullscreen"
            >
              <ZoomIn className="w-4 h-4 text-[#888888]" />
            </button>
          </div>
        </div>

        {/* Main slide view */}
        <div className="relative aspect-video bg-black">
          {/* Slide image */}
          <img
            src={currentSlide.imagePath}
            alt={`Slide ${currentIndex + 1}`}
            className="w-full h-full object-contain"
          />

          {/* Navigation arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-white" />
              </button>
            </>
          )}

          {/* Timestamp badge */}
          <button
            onClick={handleSeek}
            className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded flex items-center gap-1.5 text-xs font-mono text-white hover:bg-black/90 transition-colors"
            title="Jump to this timestamp"
          >
            <Clock className="w-3 h-3" />
            {formatTimestamp(currentSlide.timestamp)}
          </button>

          {/* Slide counter */}
          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 rounded text-xs font-mono text-white">
            {currentIndex + 1} / {slides.length}
          </div>
        </div>

        {/* OCR Text panel */}
        {showOcr && currentSlide.ocrText && (
          <div className="p-4 border-t border-white/10 max-h-32 overflow-y-auto">
            <p className="text-sm text-[#888888] whitespace-pre-wrap">
              {currentSlide.ocrText}
            </p>
          </div>
        )}

        {/* Thumbnail strip */}
        {slides.length > 1 && (
          <div className="p-2 border-t border-white/10 overflow-x-auto">
            <div className="flex gap-2">
              {slides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-20 aspect-video rounded overflow-hidden border-2 transition-colors ${
                    index === currentIndex
                      ? 'border-white/40'
                      : 'border-transparent hover:border-white/20'
                  }`}
                >
                  <img
                    src={slide.imagePath}
                    alt={`Slide ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeModal}
        >
          <div
            className="relative max-w-7xl max-h-[90vh] w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Slide image */}
            <img
              src={currentSlide.imagePath}
              alt={`Slide ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] mx-auto object-contain"
            />

            {/* Navigation */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="w-8 h-8 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="w-8 h-8 text-white" />
                </button>
              </>
            )}

            {/* Info bar */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 px-4 py-2 bg-black/70 rounded-full">
              <button
                onClick={handleSeek}
                className="flex items-center gap-1.5 text-sm font-mono text-white hover:text-[#EAEAEA] transition-colors"
              >
                <Clock className="w-4 h-4" />
                {formatTimestamp(currentSlide.timestamp)}
              </button>
              <span className="text-sm font-mono text-[#888888]">
                {currentIndex + 1} / {slides.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
