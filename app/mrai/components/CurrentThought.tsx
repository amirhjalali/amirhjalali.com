'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Brain } from 'lucide-react'

interface StateData {
  currentThought?: string
  currentDay: number
  openQuestions?: string[]
}

export default function CurrentThought() {
  const [thought, setThought] = useState<string | null>(null)
  const [day, setDay] = useState<number>(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/mrai-state.json')
      .then(res => res.json())
      .then((data: StateData) => {
        setThought(data.currentThought || null)
        setDay(data.currentDay)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="glass rounded-xl border border-white/10 p-6 animate-pulse">
        <div className="h-4 w-24 bg-white/5 rounded mb-4" />
        <div className="h-6 w-full bg-white/5 rounded" />
      </div>
    )
  }

  if (!thought) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass rounded-xl border border-white/10 p-6"
    >
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-lg bg-white/5 flex-shrink-0">
          <Brain className="w-5 h-5 text-[#888888]" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
              Currently thinking about
            </span>
            <span className="text-xs font-mono text-[#666666]">
              &bull; Day {day}
            </span>
          </div>
          <p className="text-lg font-serif font-light text-[#EAEAEA] leading-relaxed italic">
            &ldquo;{thought}&rdquo;
          </p>
        </div>
      </div>
    </motion.div>
  )
}
