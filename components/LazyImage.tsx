'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface LazyImageProps {
  src: string
  alt: string
  className?: string
  wrapperClassName?: string
  aspectRatio?: 'square' | 'video' | 'portrait' | 'wide'
  priority?: boolean
  onLoad?: () => void
  placeholder?: 'blur' | 'skeleton'
}

export default function LazyImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  aspectRatio = 'video',
  priority = false,
  onLoad,
  placeholder = 'skeleton'
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [error, setError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Aspect ratio classes
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    wide: 'aspect-[21/9]'
  }

  useEffect(() => {
    if (!containerRef.current || priority) {
      setIsInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [priority])

  useEffect(() => {
    if (!isInView || !imgRef.current) return

    const img = imgRef.current
    
    if (img.complete) {
      setIsLoaded(true)
      onLoad?.()
    }
  }, [isInView, onLoad])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        aspectRatioClasses[aspectRatio],
        wrapperClassName
      )}
    >
      {/* Placeholder */}
      {!isLoaded && placeholder === 'skeleton' && (
        <Skeleton className="absolute inset-0 w-full h-full" />
      )}
      
      {!isLoaded && placeholder === 'blur' && (
        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 animate-pulse" />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
          <div className="text-center">
            <div className="text-4xl mb-2">🖼️</div>
            <p className="text-sm text-gray-400">Failed to load image</p>
          </div>
        </div>
      )}

      {/* Image */}
      {isInView && !error && (
        <motion.img
          ref={imgRef}
          src={src}
          alt={alt}
          className={cn(
            'w-full h-full object-cover',
            className,
            !isLoaded && 'opacity-0'
          )}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ 
            opacity: isLoaded ? 1 : 0,
            scale: isLoaded ? 1 : 1.1
          }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
        />
      )}
    </div>
  )
}