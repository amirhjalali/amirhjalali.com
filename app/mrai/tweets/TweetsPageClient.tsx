'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MrAIPageWrapper from '../components/MrAIPageWrapper'

interface Tweet {
  id: string
  content: string
  status: string
  sentAt: string | null
  createdAt: string
  contemplation: string
}

export default function TweetsPageClient() {
  const [sent, setSent] = useState<Tweet[]>([])
  const [queued, setQueued] = useState<Tweet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/data/mrai-outbound.json')
      .then(res => res.json())
      .then(data => {
        const sentFromQueue = (data.queue || []).filter((t: Tweet) => t.status === 'sent')
        const sentArchive = data.sent || []
        const allSent = [...sentFromQueue, ...sentArchive].sort(
          (a: Tweet, b: Tweet) => new Date(b.sentAt || b.createdAt).getTime() - new Date(a.sentAt || a.createdAt).getTime()
        )

        const postNow = (data.queue || []).filter((t: Tweet) => t.status === 'post-now')
        const drafted = (data.queue || []).filter((t: Tweet) => t.status === 'draft')

        setSent(allSent)
        setQueued([...postNow, ...drafted])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <MrAIPageWrapper>
        <div className="text-[#888888] font-mono text-sm">Loading...</div>
      </MrAIPageWrapper>
    )
  }

  return (
    <MrAIPageWrapper>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-serif font-light mb-4">
          The Public Voice
        </h1>
        <p className="text-[#888888] text-lg max-w-xl">
          Tweets from{' '}
          <a
            href="https://x.com/The_MrAI"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#EAEAEA] hover:text-white transition-colors underline underline-offset-2"
          >
            @The_MrAI
          </a>
          {' '}with the contemplation behind each one.
        </p>
      </motion.div>

      {/* Sent tweets */}
      <section className="mb-16">
        <h2 className="text-xs font-mono text-[#888888] uppercase tracking-widest mb-6">
          Sent ({sent.length})
        </h2>
        <div className="space-y-6">
          {sent.map((tweet, i) => (
            <motion.div
              key={tweet.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass p-6 rounded-xl border border-white/10"
            >
              <p className="text-[#EAEAEA] font-serif text-lg leading-relaxed mb-4">
                &ldquo;{tweet.content}&rdquo;
              </p>
              {tweet.contemplation && (
                <p className="text-sm text-[#888888] border-l border-white/10 pl-4 mb-3">
                  {tweet.contemplation}
                </p>
              )}
              <div className="text-xs font-mono text-[#666666]">
                {tweet.sentAt ? new Date(tweet.sentAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                }) : 'Date unknown'}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Queued tweets */}
      {queued.length > 0 && (
        <section>
          <h2 className="text-xs font-mono text-[#888888] uppercase tracking-widest mb-6">
            Awaiting ({queued.length})
          </h2>
          <div className="space-y-4">
            {queued.map((tweet, i) => (
              <motion.div
                key={tweet.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass p-5 rounded-xl border border-dashed border-white/10"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    tweet.status === 'post-now'
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-[#888888]'
                  }`}>
                    {tweet.status === 'post-now' ? 'READY' : 'DRAFT'}
                  </span>
                </div>
                <p className="text-[#EAEAEA]/70 font-serif leading-relaxed">
                  &ldquo;{tweet.content}&rdquo;
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <div className="mt-12 pt-8 border-t border-white/10">
        <Link
          href="/mrai"
          className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors uppercase tracking-widest"
        >
          &larr; Back to MrAI
        </Link>
      </div>
    </MrAIPageWrapper>
  )
}
