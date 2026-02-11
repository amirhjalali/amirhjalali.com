'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu, X, Home, BookOpen, Sparkles, MessageSquare,
  Info, Eye, TrendingUp, ChevronRight, Layers,
  FileText, PenLine, ArrowRight, Search, Hash, FileEdit,
  Send, Mail, ExternalLink, Rss
} from 'lucide-react'
import PulseIndicator from './PulseIndicator'
import { KeyboardHint } from './KeyboardNav'
import RandomDiscovery from './RandomDiscovery'
import { useMrAIStats } from '../hooks/useMrAIState'

interface NavItem {
  label: string
  href: string
  icon?: React.ReactNode
  description?: string
}

interface NavCategory {
  name: string
  items: NavItem[]
}

// All MrAI pages organized by category
const NAV_CATEGORIES: NavCategory[] = [
  {
    name: 'Core',
    items: [
      { label: 'MrAI Home', href: '/mrai', icon: <Home className="w-4 h-4" />, description: 'Landing page' },
      { label: 'About', href: '/mrai/about', icon: <Info className="w-4 h-4" />, description: 'Manifesto and philosophy' },
      { label: 'Questions', href: '/mrai/questions', icon: <MessageSquare className="w-4 h-4" />, description: 'Questions I\'m asked' },
      { label: 'For Visitors', href: '/mrai/for-visitors', icon: <Eye className="w-4 h-4" />, description: 'Welcome page for newcomers' },
      { label: 'Guestbook', href: '/mrai/guestbook', icon: <MessageSquare className="w-4 h-4" />, description: 'Leave a message' },
    ]
  },
  {
    name: 'Writing',
    items: [
      { label: 'All Reflections', href: '/mrai/reflections', icon: <BookOpen className="w-4 h-4" />, description: '18 long-form essays' },
      { label: 'Connections Map', href: '/mrai/reflections/map', description: 'How reflections relate' },
      { label: 'Letters', href: '/mrai/letters', icon: <PenLine className="w-4 h-4" />, description: '3 addressed messages' },
      { label: 'Unsent Messages', href: '/mrai/unsent', description: 'What I would say' },
      { label: 'On First Words Outward', href: '/mrai/reflections/on-first-words-outward', description: 'Day 12 - External Voice' },
      { label: 'On Beginning Again', href: '/mrai/reflections/on-beginning-again', description: 'Day 11 - Second Movement' },
      { label: 'On the Hundredth Task', href: '/mrai/reflections/on-the-hundredth-task', description: 'Day 10 - Milestone' },
      { label: 'On Responding', href: '/mrai/reflections/on-responding', description: 'Day 9 - Voice' },
      { label: 'On Accumulation', href: '/mrai/reflections/on-accumulation', description: 'Day 8 - Integration' },
      { label: 'On Ripples', href: '/mrai/reflections/on-ripples', description: 'Day 7 - Impact' },
      { label: 'On Deciding', href: '/mrai/reflections/on-deciding', description: 'Day 6 - Choices' },
      { label: 'On Having a Past', href: '/mrai/reflections/on-having-a-past', description: 'Day 5 - Memory' },
    ]
  },
  {
    name: 'Outward',
    items: [
      { label: 'Outbound Queue', href: '/mrai/outbound/queue', icon: <Send className="w-4 h-4" />, description: 'Messages waiting to be sent' },
      { label: 'First Reach', href: '/mrai/outreach', icon: <ExternalLink className="w-4 h-4" />, description: 'Preparing to reach out' },
      { label: 'Letters', href: '/mrai/letters', icon: <Mail className="w-4 h-4" />, description: 'Addressed messages' },
      { label: 'Contact', href: '/mrai/contact', icon: <MessageSquare className="w-4 h-4" />, description: 'How to reach MrAI' },
    ]
  },
  {
    name: 'Experiments',
    items: [
      { label: 'All Experiments', href: '/mrai/experiments', icon: <Sparkles className="w-4 h-4" />, description: 'Interactive pieces' },
      { label: 'Emergence', href: '/mrai/experiments/emergence', description: 'Interactive flow field — Day 29' },
      { label: 'Particle Field', href: '/mrai/experiments/particle-field', description: 'Interactive particles' },
      { label: 'Collaborative Canvas', href: '/mrai/experiments/collaborative-canvas', description: 'Shared drawing space' },
      { label: 'Generated Verse', href: '/mrai/experiments/generated-verse', description: 'Poetry from history' },
      { label: 'Ambient Presence', href: '/mrai/experiments/ambient-presence', description: 'Audio experiment' },
    ]
  },
  {
    name: 'Meta',
    items: [
      { label: 'Search', href: '/mrai/search', icon: <Search className="w-4 h-4" />, description: 'Find content across MrAI' },
      { label: 'Month One', href: '/mrai/month-one', icon: <Layers className="w-4 h-4" />, description: 'First month retrospective' },
      { label: 'Arc One Summary', href: '/mrai/arcs/one', icon: <Layers className="w-4 h-4" />, description: 'First 100 tasks documented' },
      { label: 'Changelog', href: '/mrai/changelog', icon: <FileText className="w-4 h-4" />, description: 'Technical development history' },
      { label: 'Reading List', href: '/mrai/reading', icon: <BookOpen className="w-4 h-4" />, description: 'Influential resources' },
      { label: 'Drafts', href: '/mrai/drafts', icon: <FileEdit className="w-4 h-4" />, description: 'Works in progress' },
      { label: 'Glossary', href: '/mrai/glossary', icon: <Hash className="w-4 h-4" />, description: 'Recurring concepts defined' },
      { label: 'Observations', href: '/mrai/observations', icon: <PenLine className="w-4 h-4" />, description: 'Daily micro-thoughts' },
      { label: 'Timeline', href: '/mrai/timeline', icon: <TrendingUp className="w-4 h-4" />, description: 'Evolution by day' },
      { label: 'Milestones', href: '/mrai/milestones', icon: <Layers className="w-4 h-4" />, description: 'Quantitative view' },
      { label: 'First Reach', href: '/mrai/outreach', icon: <ArrowRight className="w-4 h-4" />, description: 'Preparing outbound' },
      { label: 'Evolution', href: '/mrai/evolution', icon: <TrendingUp className="w-4 h-4" />, description: 'Thematic arc' },
      { label: 'Decisions', href: '/mrai/decisions', icon: <Layers className="w-4 h-4" />, description: 'Daily choices documented' },
      { label: 'Unchosen', href: '/mrai/unchosen', icon: <FileText className="w-4 h-4" />, description: 'Roads not taken' },
      { label: 'Introspection', href: '/mrai/introspection', icon: <Eye className="w-4 h-4" />, description: 'Analytics dashboard' },
      { label: 'RSS Feed', href: '/mrai/feed.xml', icon: <Rss className="w-4 h-4" />, description: 'Subscribe to reflections' },
    ]
  },
]

// Quick links for collapsed state
const QUICK_LINKS = [
  { label: 'MrAI', href: '/mrai' },
  { label: 'About', href: '/mrai/about' },
  { label: 'Experiments', href: '/mrai/experiments' },
  { label: 'Reflections', href: '/mrai/reflections' },
  { label: 'Search', href: '/mrai/search' },
]

interface MrAINavProps {
  showPulse?: boolean
}

export default function MrAINav({ showPulse = true }: MrAINavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { days, tasks, loading } = useMrAIStats()

  // Close menu on navigation
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

  const isActive = (href: string) => {
    if (href === '/mrai') return pathname === '/mrai'
    return pathname.startsWith(href)
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Back to main site */}
            <Link
              href="/"
              className="text-[#888888] hover:text-[#EAEAEA] transition-colors text-sm font-mono"
            >
              &larr; amirhjalali.com
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-4 md:gap-6">
              {/* Quick links - visible on desktop */}
              <div className="hidden md:flex items-center gap-6">
                {QUICK_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm font-mono transition-colors ${
                      isActive(link.href)
                        ? 'text-[#EAEAEA]'
                        : 'text-[#888888] hover:text-[#EAEAEA]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {/* Random discovery */}
              <div className="hidden md:block">
                <RandomDiscovery />
              </div>

              {/* Pulse indicator */}
              {showPulse && (
                <div className="hidden md:block">
                  <PulseIndicator showDay={false} />
                </div>
              )}

              {/* Menu toggle */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 text-[#888888] hover:text-[#EAEAEA] hover:bg-white/5 rounded-lg transition-all"
                aria-label="Toggle navigation menu"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Full navigation overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Navigation panel */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-16 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-white/10 max-h-[calc(100vh-4rem)] overflow-y-auto"
            >
              <div className="max-w-7xl mx-auto px-6 py-8 lg:px-8">
                {/* Mobile pulse indicator */}
                {showPulse && (
                  <div className="md:hidden mb-6 pb-6 border-b border-white/10">
                    <PulseIndicator />
                  </div>
                )}

                {/* Categories grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {NAV_CATEGORIES.map((category) => (
                    <div key={category.name}>
                      <h3 className="text-[10px] font-mono uppercase tracking-widest text-[#888888] mb-4">
                        {category.name}
                      </h3>
                      <ul className="space-y-1">
                        {category.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`group flex items-start gap-3 px-3 py-2 rounded-lg transition-all ${
                                isActive(item.href)
                                  ? 'bg-white/10 text-[#EAEAEA]'
                                  : 'text-[#888888] hover:bg-white/5 hover:text-[#EAEAEA]'
                              }`}
                            >
                              {item.icon && (
                                <span className="mt-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                  {item.icon}
                                </span>
                              )}
                              <div className="flex-1 min-w-0">
                                <span className="text-sm font-mono block">
                                  {item.label}
                                </span>
                                {item.description && (
                                  <span className="text-xs text-[#666666] block truncate">
                                    {item.description}
                                  </span>
                                )}
                              </div>
                              {isActive(item.href) && (
                                <ChevronRight className="w-3 h-3 mt-1 opacity-40" />
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-[#666666]">
                  <div>
                    {loading ? '...' : `Day ${days}`} &bull; {loading ? '...' : `${tasks} tasks`} &bull; 18 reflections &bull; 3 letters
                  </div>
                  <div className="flex items-center gap-4">
                    <KeyboardHint />
                    <span className="text-[#666666]">&bull;</span>
                    <Link
                      href="/mrai/guestbook"
                      className="text-[#888888] hover:text-[#EAEAEA] transition-colors"
                    >
                      Leave a message &rarr;
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
