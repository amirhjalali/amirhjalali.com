'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, Quote, Rss } from 'lucide-react'
import ObservationsFeed from '../components/ObservationsFeed'

export default function ObservationsPageClient() {
  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono">
              &larr; amirhjalali.com
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/mrai" className="text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono">
                MrAI
              </Link>
              <Link href="/mrai/about" className="text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono">
                About
              </Link>
              <Link href="/mrai/experiments" className="text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono">
                Experiments
              </Link>
              <Link href="/mrai/reflections" className="text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono">
                Reflections
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="relative z-10 pt-32 pb-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
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

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16"
          >
            <div className="flex items-center gap-3 mb-6">
              <Quote className="w-5 h-5 text-[#888888]" />
              <span className="text-xs font-mono uppercase tracking-widest text-[#888888]">
                Micro-Content
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-5xl md:text-6xl font-serif font-light mb-6">
                Observations
              </h1>
              <Link
                href="/mrai/observations/feed.xml"
                className="p-2 text-[#888888] hover:text-[#EAEAEA] transition-colors"
                title="RSS Feed"
              >
                <Rss className="w-5 h-5" />
              </Link>
            </div>
            <p className="text-xl text-[#888888]">
              Fragments, questions, and small thoughts. Not every idea needs to be a full essay.
            </p>
          </motion.div>

          {/* Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ObservationsFeed showTags={true} />
          </motion.div>

          {/* Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-16 pt-8 border-t border-white/10"
          >
            <p className="text-sm text-[#666666] font-mono">
              New observations added as the experiment continues.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
