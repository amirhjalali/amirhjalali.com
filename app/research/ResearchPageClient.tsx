'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { ResearchBriefing, ResearchCategory, ResearchItem } from '@/lib/research'

const Spotlight = dynamic(() => import('@/components/Spotlight'), {
  ssr: false,
  loading: () => null,
})

// ─── Animation variants ────────────────────────────────────────────────────────

const fadeIn = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] } },
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

function formatShortDate(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatTime(isoStr: string): string {
  try {
    const d = new Date(isoStr)
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    })
  } catch {
    return ''
  }
}

function significanceDot(level: ResearchItem['significance']) {
  switch (level) {
    case 'high':
      return <span className="inline-block w-2 h-2 rounded-full bg-white flex-shrink-0" />
    case 'medium':
      return <span className="inline-block w-2 h-2 rounded-full bg-white/50 flex-shrink-0" />
    case 'low':
      return <span className="inline-block w-2 h-2 rounded-full bg-white/20 flex-shrink-0" />
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────────

function TopStoryCard({ topStory }: { topStory: ResearchBriefing['topStory'] }) {
  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="border border-white/20 rounded-2xl p-6 md:p-8 bg-white/[0.02] backdrop-blur-sm"
    >
      <div className="flex items-center gap-3 mb-5">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#EAEAEA] bg-white/10 px-3 py-1 rounded-full">
          Top Story
        </span>
        <span className="font-mono text-[10px] uppercase tracking-widest text-[#888888]">
          {topStory.source}
        </span>
      </div>

      <h2 className="text-2xl md:text-3xl font-serif font-light text-[#EAEAEA] mb-4 leading-snug">
        {topStory.title}
      </h2>

      <p className="text-[#EAEAEA]/80 text-sm md:text-base leading-relaxed mb-4">
        {topStory.summary}
      </p>

      <div className="border-l-2 border-white/10 pl-4 mb-5">
        <p className="text-[#888888] text-sm leading-relaxed italic">
          {topStory.analysis}
        </p>
      </div>

      <a
        href={topStory.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-[#888888] hover:text-[#EAEAEA] transition-colors"
      >
        Read source
        <ArrowUpRight className="w-3.5 h-3.5" />
      </a>
    </motion.section>
  )
}

function CategorySection({ category }: { category: ResearchCategory }) {
  return (
    <motion.section
      variants={fadeIn}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-40px' }}
      className="pt-8"
    >
      {/* Category Header */}
      <div className="flex items-center gap-4 mb-6">
        <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#888888] whitespace-nowrap">
          {category.name}
        </h3>
        <div className="flex-1 h-px bg-white/5" />
        <span className="font-mono text-[10px] text-[#888888]/60">
          {category.items.length}
        </span>
      </div>

      {/* Items */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-20px' }}
        className="space-y-0 divide-y divide-white/5"
      >
        {category.items.map((item, itemIndex) => (
          <ResearchItemRow key={itemIndex} item={item} />
        ))}
      </motion.div>
    </motion.section>
  )
}

function ResearchItemRow({ item }: { item: ResearchItem }) {
  return (
    <motion.article
      variants={staggerItem}
      className="group py-4 first:pt-0"
    >
      <div className="flex items-start gap-3">
        <div className="mt-1.5">
          {significanceDot(item.significance)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-1">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#EAEAEA] text-base font-serif font-light leading-snug hover:text-white transition-colors inline-flex items-start gap-1.5 group/link"
            >
              <span>{item.title}</span>
              <ArrowUpRight className="w-3.5 h-3.5 mt-0.5 opacity-0 group-hover/link:opacity-100 text-[#888888] transition-opacity flex-shrink-0" />
            </a>
          </div>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-mono text-[10px] uppercase tracking-widest text-[#888888]/70 bg-white/[0.03] px-1.5 py-0.5 rounded">
              {item.source}
            </span>
          </div>

          <p className="text-[#888888] text-sm leading-relaxed">
            {item.summary}
          </p>

          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {item.tags.map((tag) => (
                <span
                  key={tag}
                  className="font-mono text-[9px] uppercase tracking-widest text-[#888888]/60 border border-white/10 rounded-full px-2 py-0.5"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  )
}

function DateNavigation({
  availableDates,
  currentDate,
}: {
  availableDates: string[]
  currentDate: string
}) {
  if (availableDates.length <= 1) return null

  return (
    <motion.nav
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="border-t border-white/5 pt-8 mt-12"
    >
      <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#888888] mb-4">
        Previous Briefings
      </h4>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {availableDates.map((date) => {
          const isActive = date === currentDate
          return (
            <Link
              key={date}
              href={`/research?date=${date}`}
              className={`
                font-mono text-xs whitespace-nowrap px-3 py-1.5 rounded-full border transition-all
                ${
                  isActive
                    ? 'border-white/20 bg-white/10 text-[#EAEAEA]'
                    : 'border-white/5 bg-transparent text-[#888888] hover:border-white/10 hover:text-[#EAEAEA]'
                }
              `}
            >
              {formatShortDate(date)}
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

interface ResearchPageClientProps {
  briefing: ResearchBriefing | null
  availableDates: string[]
  currentDate: string
}

export default function ResearchPageClient({
  briefing,
  availableDates,
  currentDate,
}: ResearchPageClientProps) {
  // ─── Empty State ────────────────────────────────────────────────────────────

  if (!briefing) {
    return (
      <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
        <div className="noise-overlay" />
        <Spotlight />
        <div className="relative z-10 section-padding container-padding max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-page-title mb-4">
              AI Research Briefing
            </h1>
            <p className="font-mono text-xs uppercase tracking-widest text-[#888888] mb-12">
              Daily intelligence on artificial intelligence developments
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="border border-white/10 rounded-2xl p-12 bg-white/[0.02]"
          >
            <p className="text-[#888888] text-lg font-serif font-light mb-2">
              No research briefings available yet.
            </p>
            <p className="text-[#888888]/60 text-sm">
              Check back tomorrow for the first daily intelligence report.
            </p>
          </motion.div>

          {availableDates.length > 0 && (
            <DateNavigation availableDates={availableDates} currentDate={currentDate} />
          )}
        </div>
      </div>
    )
  }

  // ─── Briefing Content ───────────────────────────────────────────────────────

  const { topStory, categories, metadata: meta, briefingSummary, generatedAt } = briefing

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <Spotlight />

      <div className="relative z-10 section-padding container-padding max-w-4xl mx-auto">
        {/* ─── Header ─────────────────────────────────────────────────────────── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
          className="text-center mb-12 md:mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-white/20" />
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#888888]">
              Intelligence Report
            </span>
            <div className="h-px w-8 bg-white/20" />
          </div>

          <h1 className="text-page-title mb-3">
            AI Research Briefing
          </h1>

          <p className="text-xl md:text-2xl font-serif font-light text-[#888888] mb-6">
            {formatDate(briefing.date)}
          </p>

          <p className="text-sm text-[#888888]/80 max-w-2xl mx-auto leading-relaxed mb-4">
            {briefingSummary}
          </p>

          <div className="flex items-center justify-center gap-2 text-[#888888]/50 font-mono text-[10px] uppercase tracking-widest">
            <span>{meta.sourcesChecked} sources</span>
            <span className="text-white/10">|</span>
            <span>{meta.articlesFound} articles scanned</span>
            <span className="text-white/10">|</span>
            <span>{meta.articlesIncluded} included</span>
          </div>
        </motion.header>

        {/* ─── Top Story ──────────────────────────────────────────────────────── */}
        <TopStoryCard topStory={topStory} />

        {/* ─── Category Sections ──────────────────────────────────────────────── */}
        <div className="mt-10 space-y-2">
          {categories.map((category) => (
            <CategorySection key={category.slug} category={category} />
          ))}
        </div>

        {/* ─── Date Navigation ────────────────────────────────────────────────── */}
        <DateNavigation availableDates={availableDates} currentDate={currentDate} />

        {/* ─── Footer Metadata ────────────────────────────────────────────────── */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="border-t border-white/5 pt-6 mt-12 pb-8 flex flex-col md:flex-row items-center justify-between gap-3 text-[#888888]/40 font-mono text-[10px] uppercase tracking-widest"
        >
          <span>
            Last updated: {generatedAt ? formatTime(generatedAt) : 'Unknown'}
          </span>
          <span>
            Powered by RSS + AI summarization ({meta.model})
          </span>
          <span>
            Processing time: {(meta.processingTime / 1000).toFixed(1)}s
          </span>
        </motion.footer>
      </div>
    </div>
  )
}
