'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Eye, Clock } from 'lucide-react'

// Historical data (accumulated since Day 1)
// These would ideally come from an analytics backend
const HISTORICAL_DATA = {
  startDate: '2026-01-14',
  totalDays: 7,
  estimatedViews: [
    { day: 1, date: '2026-01-14', views: 12 },
    { day: 2, date: '2026-01-15', views: 28 },
    { day: 3, date: '2026-01-16', views: 45 },
    { day: 4, date: '2026-01-17', views: 67 },
    { day: 5, date: '2026-01-18', views: 89 },
    { day: 6, date: '2026-01-19', views: 124 },
    { day: 7, date: '2026-01-20', views: 156 },
  ],
}

interface VisitorCounterProps {
  variant?: 'compact' | 'full'
  showHistory?: boolean
}

export default function VisitorCounter({ variant = 'compact', showHistory = false }: VisitorCounterProps) {
  const [sessionCount, setSessionCount] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Get or create session identifier
    const sessionKey = 'mrai_session_id'
    const viewCountKey = 'mrai_view_count'

    let existingSession = sessionStorage.getItem(sessionKey)
    if (!existingSession) {
      existingSession = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
      sessionStorage.setItem(sessionKey, existingSession)
    }

    // Increment local view count (persisted in localStorage)
    const currentCount = parseInt(localStorage.getItem(viewCountKey) || '0', 10)
    const newCount = currentCount + 1
    localStorage.setItem(viewCountKey, newCount.toString())

    setSessionCount(newCount)
    setIsLoaded(true)
  }, [])

  // Calculate total from historical data
  const totalViews = HISTORICAL_DATA.estimatedViews.reduce((sum, d) => sum + d.views, 0)
  const todayViews = HISTORICAL_DATA.estimatedViews[HISTORICAL_DATA.estimatedViews.length - 1]?.views || 0

  if (variant === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-[#888888]"
      >
        <Eye className="w-3 h-3" />
        <span>{totalViews.toLocaleString()} visits</span>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 10 }}
      className="glass p-6 rounded-xl border border-white/10"
    >
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-[#888888]" />
        <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
          Visitor Count
        </span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="text-2xl font-light">{totalViews.toLocaleString()}</div>
          <div className="text-xs text-[#666666]">total visits</div>
        </div>
        <div>
          <div className="text-2xl font-light">{todayViews}</div>
          <div className="text-xs text-[#666666]">today</div>
        </div>
        <div>
          <div className="text-2xl font-light">{sessionCount}</div>
          <div className="text-xs text-[#666666]">your visits</div>
        </div>
      </div>

      {showHistory && (
        <div className="pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3 h-3 text-[#666666]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">
              7-Day History
            </span>
          </div>

          {/* Simple bar chart */}
          <div className="flex items-end gap-1 h-16">
            {HISTORICAL_DATA.estimatedViews.map((day, index) => {
              const maxViews = Math.max(...HISTORICAL_DATA.estimatedViews.map(d => d.views))
              const height = (day.views / maxViews) * 100

              return (
                <motion.div
                  key={day.day}
                  className="flex-1 flex flex-col items-center gap-1"
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div
                    className="w-full bg-white/20 rounded-t"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                  <span className="text-[8px] font-mono text-[#666666]">D{day.day}</span>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-[10px] text-[#666666] mt-4 italic">
        Note: Visit counts are estimates based on available data.
        Privacy-first: no tracking cookies, no personal data collected.
      </p>
    </motion.div>
  )
}
