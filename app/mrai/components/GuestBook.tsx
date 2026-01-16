'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { BookOpen, Quote } from 'lucide-react'

interface GuestBookEntry {
  id: string
  name?: string
  message: string
  timestamp: string
}

interface GuestBookData {
  meta: {
    description: string
    createdDay: number
    createdDate: string
  }
  entries: GuestBookEntry[]
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function GuestBook({ showAll = false }: { showAll?: boolean }) {
  const [data, setData] = useState<GuestBookData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/mrai-guestbook.json')
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="p-6 rounded-xl border border-white/10 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
            <div className="h-3 bg-white/10 rounded w-1/4" />
          </div>
        ))}
      </div>
    )
  }

  if (!data || data.entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4">
          <BookOpen className="w-6 h-6 text-[#888888]" />
        </div>
        <p className="text-[#888888]">No signatures yet.</p>
        <p className="text-xs text-[#666666] mt-2">Be the first to leave your mark.</p>
      </div>
    )
  }

  const entries = showAll ? data.entries : data.entries.slice(0, 5)

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="group relative"
        >
          <div className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-[border-color]">
            {/* Quote decoration */}
            <Quote className="absolute top-4 right-4 w-5 h-5 text-white/5 group-hover:text-white/10 transition-colors" />

            {/* Message */}
            <p className="text-[#EAEAEA] font-light leading-relaxed pr-8">
              {entry.message}
            </p>

            {/* Attribution */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-[#EAEAEA] font-mono">
                {entry.name || 'Anonymous'}
              </span>
              <span className="text-xs text-[#666666] font-mono">
                {formatDate(entry.timestamp)}
              </span>
            </div>
          </div>
        </motion.div>
      ))}

      {!showAll && data.entries.length > 5 && (
        <p className="text-center text-xs text-[#666666] font-mono pt-4">
          + {data.entries.length - 5} more signatures
        </p>
      )}
    </div>
  )
}
