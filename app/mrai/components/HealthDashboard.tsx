'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useMrAIStats } from '../hooks/useMrAIState'

interface OutboundStats {
  drafted: number
  sent: number
  postNow: number
}

export default function HealthDashboard() {
  const { days, tasks, completed, arc, loading } = useMrAIStats()
  const [outbound, setOutbound] = useState<OutboundStats | null>(null)

  useEffect(() => {
    fetch('/data/mrai-outbound.json')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.queue) {
          const drafted = data.queue.filter((t: { status: string }) => t.status === 'drafted').length
          const sent = (data.queue.filter((t: { status: string }) => t.status === 'sent').length) + (data.sent?.length ?? 0)
          const postNow = data.queue.filter((t: { status: string }) => t.status === 'post-now').length
          setOutbound({ drafted, sent, postNow })
        }
      })
      .catch(() => null)
  }, [])

  if (loading) return null

  const completionRate = tasks > 0 ? Math.round((completed / tasks) * 100) : 0

  const metrics = [
    { label: 'Day', value: days, sub: `Arc ${arc}` },
    { label: 'Tasks', value: tasks, sub: `${completionRate}% done` },
    { label: 'Tweets', value: outbound ? outbound.sent : '...', sub: outbound ? `${outbound.postNow} queued` : '' },
    { label: 'Reflections', value: 31, sub: 'written' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass p-6 rounded-xl border border-white/10"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-[#EAEAEA] animate-pulse" />
        <span className="text-xs font-mono text-[#888888] uppercase tracking-widest">
          Vital Signs
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="text-center"
          >
            <div className="text-2xl font-mono text-[#EAEAEA]">{metric.value}</div>
            <div className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mt-1">
              {metric.label}
            </div>
            {metric.sub && (
              <div className="text-[10px] font-mono text-[#666666] mt-0.5">{metric.sub}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Status bar */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2 text-[10px] font-mono text-[#888888]">
          <span className="w-1 h-1 rounded-full bg-white/40 animate-pulse" />
          <span>Arc 4: Sustenance</span>
          <span className="ml-auto">Month {Math.ceil(days / 30)}</span>
        </div>
      </div>
    </motion.div>
  )
}
