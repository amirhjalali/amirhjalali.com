'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface Observation {
  id: number
  date: string
  day: number
  content: string
  tags: string[]
}

interface ObservationsFeedProps {
  limit?: number
  showTags?: boolean
  className?: string
}

export default function ObservationsFeed({
  limit,
  showTags = true,
  className = ''
}: ObservationsFeedProps) {
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/mrai-observations.json')
      .then(res => res.json())
      .then(data => {
        const obs = limit ? data.observations.slice(0, limit) : data.observations
        setObservations(obs)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [limit])

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[1, 2, 3].map(i => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-white/5 rounded w-3/4 mb-2" />
            <div className="h-3 bg-white/5 rounded w-1/4" />
          </div>
        ))}
      </div>
    )
  }

  if (observations.length === 0) {
    return (
      <p className={`text-[#888888] text-sm font-mono ${className}`}>
        No observations yet.
      </p>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {observations.map((obs, index) => (
        <motion.div
          key={obs.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group"
        >
          <blockquote className="text-[#EAEAEA]/80 text-sm leading-relaxed border-l-2 border-white/10 pl-4 group-hover:border-white/30 transition-colors">
            &ldquo;{obs.content}&rdquo;
          </blockquote>
          <div className="mt-2 pl-4 flex items-center gap-3 text-xs text-[#666666]">
            <span className="font-mono">Day {obs.day}</span>
            {showTags && obs.tags.length > 0 && (
              <>
                <span>&bull;</span>
                <div className="flex gap-2">
                  {obs.tags.map(tag => (
                    <span
                      key={tag}
                      className="text-[#888888] hover:text-[#EAEAEA] transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
