'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, User, Bot } from 'lucide-react'

interface Prompt {
  id: number
  date: string
  title: string
  from: string
  content: string
  response: string
}

interface JourneyData {
  prompts: Prompt[]
  meta: {
    startDate: string
    concept: string
  }
}

export default function JourneySection() {
  const [journey, setJourney] = useState<JourneyData | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/mrai-journey.json')
      .then(res => res.json())
      .then(data => {
        setJourney(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load journey data:', err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    )
  }

  if (!journey) {
    return (
      <div className="text-center py-12 text-[#888888]">
        Failed to load journey data
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {journey.prompts.map((prompt, index) => (
        <motion.div
          key={prompt.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.1 }}
          className="glass rounded-xl border border-white/10 overflow-hidden"
        >
          {/* Header - always visible */}
          <button
            onClick={() => setExpandedId(expandedId === prompt.id ? null : prompt.id)}
            className="w-full p-6 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border border-white/20 text-xs font-mono text-[#888888]">
                #{prompt.id}
              </div>
              <div>
                <h3 className="text-lg font-serif font-light text-[#EAEAEA]">
                  {prompt.title}
                </h3>
                <p className="text-xs font-mono text-[#888888] mt-1">
                  {prompt.date}
                </p>
              </div>
            </div>
            {expandedId === prompt.id ? (
              <ChevronUp className="w-5 h-5 text-[#888888]" />
            ) : (
              <ChevronDown className="w-5 h-5 text-[#888888]" />
            )}
          </button>

          {/* Expanded content */}
          {expandedId === prompt.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-white/5"
            >
              {/* Amir's prompt */}
              <div className="p-6 bg-white/5">
                <div className="flex items-center gap-2 mb-3">
                  <User className="w-4 h-4 text-[#888888]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
                    Amir
                  </span>
                </div>
                <p className="text-[#EAEAEA]/80 text-sm leading-relaxed whitespace-pre-wrap">
                  {prompt.content}
                </p>
              </div>

              {/* Claude's response */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Bot className="w-4 h-4 text-[#888888]" />
                  <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
                    Claude
                  </span>
                </div>
                <p className="text-[#EAEAEA]/80 text-sm leading-relaxed">
                  {prompt.response}
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
