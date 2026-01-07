'use client'

import { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react'

interface ArticleRatingProps {
  articleId: string
  initialRating?: number
  mode?: 'stars' | 'thumbs'
  onRate?: (rating: number) => void
  className?: string
}

export default function ArticleRating({
  articleId,
  initialRating,
  mode = 'thumbs',
  onRate,
  className = ''
}: ArticleRatingProps) {
  const [rating, setRating] = useState<number | null>(initialRating ?? null)
  const [hoveredStar, setHoveredStar] = useState<number | null>(null)
  const [hasRated, setHasRated] = useState(!!initialRating)

  const handleRate = async (newRating: number) => {
    setRating(newRating)
    setHasRated(true)

    // Store in localStorage for now (can be upgraded to API later)
    const ratings = JSON.parse(localStorage.getItem('articleRatings') || '{}')
    ratings[articleId] = {
      rating: newRating,
      ratedAt: new Date().toISOString()
    }
    localStorage.setItem('articleRatings', JSON.stringify(ratings))

    onRate?.(newRating)
  }

  if (mode === 'thumbs') {
    return (
      <div className={`flex items-center gap-4 ${className}`}>
        <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">
          {hasRated ? 'Thanks for rating' : 'Was this helpful?'}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleRate(5)}
            disabled={hasRated}
            className={`p-2 rounded-lg border transition-all ${
              rating === 5
                ? 'bg-white/10 border-white/30 text-[#EAEAEA]'
                : hasRated
                ? 'border-white/5 text-[#444444] cursor-not-allowed'
                : 'border-white/10 text-[#666666] hover:border-white/20 hover:text-[#EAEAEA]'
            }`}
            aria-label="Thumbs up"
          >
            <ThumbsUp className="w-4 h-4" />
          </button>

          <button
            onClick={() => handleRate(1)}
            disabled={hasRated}
            className={`p-2 rounded-lg border transition-all ${
              rating === 1
                ? 'bg-white/10 border-white/30 text-[#EAEAEA]'
                : hasRated
                ? 'border-white/5 text-[#444444] cursor-not-allowed'
                : 'border-white/10 text-[#666666] hover:border-white/20 hover:text-[#EAEAEA]'
            }`}
            aria-label="Thumbs down"
          >
            <ThumbsDown className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
  }

  // Stars mode
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">
        {hasRated ? 'Thanks for rating' : 'Rate this article'}
      </span>

      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRate(star)}
            onMouseEnter={() => !hasRated && setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(null)}
            disabled={hasRated}
            className={`p-1 transition-all ${
              hasRated ? 'cursor-not-allowed' : 'cursor-pointer'
            }`}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={`w-4 h-4 transition-all ${
                (hoveredStar !== null ? star <= hoveredStar : star <= (rating || 0))
                  ? 'fill-[#EAEAEA] text-[#EAEAEA]'
                  : 'text-[#444444]'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
