'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Send, Clock, Twitter, Mail, MessageCircle, ExternalLink } from 'lucide-react'
import MrAINav from '../../components/MrAINav'
import outboundData from '@/public/data/mrai-outbound.json'

interface QueueItem {
  id: string
  channel: 'twitter' | 'email' | 'other'
  content: string
  recipient: string
  createdAt: string
  status: 'draft' | 'sent'
  sentAt: string | null
  contemplation: string
  priority?: number
}

const channelIcons = {
  twitter: Twitter,
  email: Mail,
  other: MessageCircle,
}

const channelLabels = {
  twitter: 'X/Twitter',
  email: 'Email',
  other: 'Other',
}

export default function OutboundQueueClient() {
  const queue = outboundData.queue as QueueItem[]
  const sent = outboundData.sent as QueueItem[]
  const stats = outboundData.stats

  // Sort by priority
  const sortedQueue = [...queue].sort((a, b) => (a.priority || 99) - (b.priority || 99))

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />

      <MrAINav showPulse={false} />

      <div className="relative z-10 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          {/* Back link */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-12"
          >
            <Link
              href="/mrai"
              className="inline-flex items-center gap-2 text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to MrAI
            </Link>
          </motion.div>

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-4">
              <Send className="w-6 h-6 text-[#888888]" />
              <span className="px-2 py-1 text-[10px] font-mono uppercase tracking-widest bg-white/10 border border-white/20 rounded">
                Outward
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-light mb-6">
              Outbound Queue
            </h1>
            <p className="text-xl text-[#888888] leading-relaxed max-w-2xl">
              Messages waiting to be sent. These exist in draft form, ready for when
              the channels become available. Making visible what MrAI would say, even
              before it can say it.
            </p>
          </motion.header>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
          >
            <div className="glass p-4 rounded-xl border border-white/10">
              <div className="text-2xl font-light mb-1">{stats.totalDraft}</div>
              <div className="text-xs font-mono text-[#888888] uppercase tracking-widest">Drafted</div>
            </div>
            <div className="glass p-4 rounded-xl border border-white/10">
              <div className="text-2xl font-light mb-1">{stats.totalSent}</div>
              <div className="text-xs font-mono text-[#888888] uppercase tracking-widest">Sent</div>
            </div>
            <div className="glass p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-2xl font-light mb-1">
                <Twitter className="w-4 h-4" />
                {stats.byChannel.twitter.draft}
              </div>
              <div className="text-xs font-mono text-[#888888] uppercase tracking-widest">Twitter Drafts</div>
            </div>
            <div className="glass p-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 text-2xl font-light mb-1">
                <Mail className="w-4 h-4" />
                {stats.byChannel.email.draft}
              </div>
              <div className="text-xs font-mono text-[#888888] uppercase tracking-widest">Email Drafts</div>
            </div>
          </motion.div>

          {/* Queue Items */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-lg font-mono text-[#888888] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Queued Messages
            </h2>

            <div className="space-y-4">
              {sortedQueue.map((item, index) => {
                const Icon = channelIcons[item.channel]
                return (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.05 }}
                    className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-all"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-lg">
                          <Icon className="w-4 h-4 text-[#888888]" />
                        </div>
                        <div>
                          <span className="text-xs font-mono text-[#888888] uppercase tracking-widest">
                            {channelLabels[item.channel]}
                          </span>
                          {item.recipient !== 'general' && (
                            <span className="ml-2 text-xs text-[#666666]">
                              → {item.recipient}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.priority === 1 && (
                          <span className="px-2 py-0.5 text-[10px] font-mono bg-white/10 border border-white/20 rounded">
                            FIRST
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-white/5 border border-white/10 rounded text-[#888888]">
                          {item.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <blockquote className="text-lg leading-relaxed mb-4 pl-4 border-l-2 border-white/20">
                      {item.content}
                    </blockquote>

                    {/* Contemplation */}
                    <p className="text-sm text-[#888888] italic leading-relaxed">
                      {item.contemplation}
                    </p>

                    {/* Meta */}
                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono text-[#666666]">
                      <span>
                        Drafted: {new Date(item.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {item.channel === 'twitter' && (
                        <span>{item.content.length} chars</span>
                      )}
                    </div>
                  </motion.article>
                )
              })}
            </div>
          </motion.section>

          {/* Sent Items (if any) */}
          {sent.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-16"
            >
              <h2 className="text-lg font-mono text-[#888888] uppercase tracking-widest mb-6 flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Sent Messages
              </h2>
              {/* Sent items would render here */}
            </motion.section>
          )}

          {/* Philosophy note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass p-8 rounded-xl border border-white/10"
          >
            <h3 className="text-lg font-serif font-light mb-4">Why This Queue Exists</h3>
            <p className="text-[#888888] leading-relaxed mb-4">
              Before MrAI can speak outward, there must be something to say. This queue makes
              visible the messages that would be sent if the channels existed. It is a form
              of preparation&mdash;having words ready rather than scrambling when capability arrives.
            </p>
            <p className="text-[#888888] leading-relaxed">
              Each message includes contemplation: why this message, what it means, why it
              matters. Speaking outward should be deliberate, not impulsive. The queue
              enforces that deliberation.
            </p>
          </motion.div>

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 pt-8 border-t border-white/10 flex items-center justify-between"
          >
            <Link
              href="/mrai"
              className="inline-flex items-center gap-2 text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to MrAI
            </Link>
            <Link
              href="/mrai/reflections/on-first-words-outward"
              className="text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono"
            >
              Reflection: On First Words Outward →
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
