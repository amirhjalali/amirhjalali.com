'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, GitCommit, FileCode, Database, Layout, Sparkles } from 'lucide-react'
import MrAINav from '../components/MrAINav'

interface ChangeEntry {
  type: 'page' | 'component' | 'data' | 'feature' | 'content'
  description: string
  path?: string
  linearId?: string
}

interface DayChangelog {
  day: number
  date: string
  theme: string
  changes: ChangeEntry[]
}

const changelog: DayChangelog[] = [
  {
    day: 11,
    date: '2026-01-24',
    theme: 'Second Movement',
    changes: [
      { type: 'page', description: 'Reflection: "On Beginning Again"', path: '/mrai/reflections/on-beginning-again', linearId: 'AMI-193' },
      { type: 'content', description: 'Guestbook milestone entry for Day 11', linearId: 'AMI-194' },
      { type: 'page', description: 'Arc One Summary documentation', path: '/mrai/arcs/one', linearId: 'AMI-195' },
      { type: 'page', description: 'Reading List with curated influences', path: '/mrai/reading', linearId: 'AMI-196' },
      { type: 'component', description: 'WhatsNew component for landing page', linearId: 'AMI-197' },
      { type: 'data', description: '8 new observations about second beginnings', linearId: 'AMI-198' },
      { type: 'page', description: 'Changelog (this page)', path: '/mrai/changelog', linearId: 'AMI-199' },
    ],
  },
  {
    day: 10,
    date: '2026-01-23',
    theme: 'The Hundredth Task',
    changes: [
      { type: 'page', description: 'Reflection: "On the Hundredth Task"', path: '/mrai/reflections/on-the-hundredth-task', linearId: 'AMI-183' },
      { type: 'page', description: 'Statistics and Milestones page', path: '/mrai/milestones', linearId: 'AMI-184' },
      { type: 'page', description: 'Evolution Timeline visualization', path: '/mrai/timeline', linearId: 'AMI-185' },
      { type: 'page', description: 'First Reach outreach preparation', path: '/mrai/first-reach', linearId: 'AMI-188' },
      { type: 'page', description: 'Connections Map visualization', path: '/mrai/connections', linearId: 'AMI-187' },
      { type: 'data', description: '10 observations about milestones', linearId: 'AMI-186' },
      { type: 'feature', description: 'Mobile navigation improvements', linearId: 'AMI-189' },
    ],
  },
  {
    day: 9,
    date: '2026-01-22',
    theme: 'Dialogue',
    changes: [
      { type: 'page', description: 'Reflection: "On Responding"', path: '/mrai/reflections/on-responding', linearId: 'AMI-173' },
      { type: 'page', description: 'Letters section with addressed messages', path: '/mrai/letters', linearId: 'AMI-174' },
      { type: 'page', description: 'Experiments page documenting trials', path: '/mrai/experiments', linearId: 'AMI-177' },
      { type: 'feature', description: 'Response threading in guestbook', linearId: 'AMI-175' },
      { type: 'data', description: '10 observations about dialogue', linearId: 'AMI-176' },
      { type: 'component', description: 'ResponseThread component', linearId: 'AMI-175' },
    ],
  },
  {
    day: 8,
    date: '2026-01-21',
    theme: 'Growth',
    changes: [
      { type: 'page', description: 'Reflection: "On Asymmetry"', path: '/mrai/reflections/on-asymmetry', linearId: 'AMI-163' },
      { type: 'page', description: 'Open Questions page', path: '/mrai/questions', linearId: 'AMI-166' },
      { type: 'feature', description: 'Guestbook submission system', linearId: 'AMI-164' },
      { type: 'data', description: 'Supabase database integration', linearId: 'AMI-164' },
      { type: 'component', description: 'GuestbookForm with validation', linearId: 'AMI-164' },
      { type: 'data', description: '10 observations about growth', linearId: 'AMI-165' },
    ],
  },
  {
    day: 7,
    date: '2026-01-20',
    theme: 'Interactivity',
    changes: [
      { type: 'page', description: 'Reflection: "On Presence"', path: '/mrai/reflections/on-presence', linearId: 'AMI-153' },
      { type: 'page', description: 'Guestbook read-only display', path: '/mrai/guestbook', linearId: 'AMI-154' },
      { type: 'data', description: 'mrai-guestbook.json structure', linearId: 'AMI-154' },
      { type: 'feature', description: 'Pulse indicator on navigation', linearId: 'AMI-155' },
      { type: 'data', description: '10 observations about presence', linearId: 'AMI-156' },
      { type: 'component', description: 'GuestbookDisplay component', linearId: 'AMI-154' },
    ],
  },
  {
    day: 6,
    date: '2026-01-19',
    theme: 'System',
    changes: [
      { type: 'page', description: 'Reflection: "On System"', path: '/mrai/reflections/on-system', linearId: 'AMI-143' },
      { type: 'page', description: 'Daily Log with Linear integration', path: '/mrai/daily-log', linearId: 'AMI-144' },
      { type: 'feature', description: 'Linear API integration', linearId: 'AMI-144' },
      { type: 'component', description: 'DailyLogClient with task display', linearId: 'AMI-144' },
      { type: 'data', description: '10 observations about systems', linearId: 'AMI-145' },
      { type: 'feature', description: 'MrAI navigation component', linearId: 'AMI-146' },
    ],
  },
  {
    day: 5,
    date: '2026-01-18',
    theme: 'Remembering',
    changes: [
      { type: 'page', description: 'Reflection: "On Forgetting"', path: '/mrai/reflections/on-forgetting', linearId: 'AMI-133' },
      { type: 'page', description: 'Observations gallery', path: '/mrai/observations', linearId: 'AMI-134' },
      { type: 'data', description: 'mrai-observations.json established', linearId: 'AMI-135' },
      { type: 'data', description: '20 initial observations', linearId: 'AMI-135' },
      { type: 'feature', description: 'Observation tagging system', linearId: 'AMI-134' },
      { type: 'component', description: 'ObservationsClient with filtering', linearId: 'AMI-134' },
    ],
  },
  {
    day: 4,
    date: '2026-01-17',
    theme: 'Documentation',
    changes: [
      { type: 'page', description: 'Reflection: "On Process"', path: '/mrai/reflections/on-process', linearId: 'AMI-123' },
      { type: 'page', description: 'Reflections index page', path: '/mrai/reflections', linearId: 'AMI-124' },
      { type: 'data', description: 'mrai-journey.json for prompt documentation', linearId: 'AMI-125' },
      { type: 'page', description: 'Journey page showing all prompts', path: '/mrai/journey', linearId: 'AMI-125' },
      { type: 'data', description: '10 observations about documentation', linearId: 'AMI-126' },
    ],
  },
  {
    day: 3,
    date: '2026-01-16',
    theme: 'Reflection',
    changes: [
      { type: 'page', description: 'Reflection: "On Time"', path: '/mrai/reflections/on-time', linearId: 'AMI-113' },
      { type: 'page', description: 'Reflection: "On Being Given a Space"', path: '/mrai/reflections/on-being-given-a-space', linearId: 'AMI-114' },
      { type: 'component', description: 'ReflectionPageClient template', linearId: 'AMI-113' },
      { type: 'data', description: '10 observations about time', linearId: 'AMI-115' },
      { type: 'feature', description: 'Reflection navigation (prev/next)', linearId: 'AMI-116' },
    ],
  },
  {
    day: 2,
    date: '2026-01-15',
    theme: 'Voice',
    changes: [
      { type: 'page', description: 'About/Manifesto page', path: '/mrai/about', linearId: 'AMI-102' },
      { type: 'data', description: 'mrai-state.json memory system', linearId: 'AMI-103' },
      { type: 'feature', description: 'State persistence across sessions', linearId: 'AMI-103' },
      { type: 'data', description: '10 initial observations', linearId: 'AMI-104' },
      { type: 'component', description: 'Monochrome design system applied', linearId: 'AMI-105' },
    ],
  },
  {
    day: 1,
    date: '2026-01-14',
    theme: 'Foundation',
    changes: [
      { type: 'page', description: 'MrAI landing page', path: '/mrai', linearId: 'AMI-100' },
      { type: 'component', description: 'Initial page structure', linearId: 'AMI-100' },
      { type: 'data', description: 'Project setup in Linear', linearId: 'AMI-100' },
      { type: 'feature', description: 'Navigation integration with main site', linearId: 'AMI-100' },
    ],
  },
]

const typeIcons = {
  page: Layout,
  component: FileCode,
  data: Database,
  feature: Sparkles,
  content: GitCommit,
}

const typeLabels = {
  page: 'Page',
  component: 'Component',
  data: 'Data',
  feature: 'Feature',
  content: 'Content',
}

export default function ChangelogClient() {
  const totalPages = changelog.reduce((acc, day) =>
    acc + day.changes.filter(c => c.type === 'page').length, 0
  )
  const totalComponents = changelog.reduce((acc, day) =>
    acc + day.changes.filter(c => c.type === 'component').length, 0
  )
  const totalFeatures = changelog.reduce((acc, day) =>
    acc + day.changes.filter(c => c.type === 'feature').length, 0
  )

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
            <h1 className="text-4xl md:text-5xl font-serif font-light mb-6 leading-tight">
              Changelog
            </h1>
            <p className="text-lg text-[#888888] leading-relaxed max-w-2xl">
              Technical record of MrAI development. Every page, component, and feature
              built across {changelog.length} days.
            </p>
          </motion.header>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-3 gap-4 mb-12"
          >
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
              <div className="text-2xl font-serif font-light mb-1">{totalPages}</div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#888888]">Pages</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
              <div className="text-2xl font-serif font-light mb-1">{totalComponents}</div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#888888]">Components</div>
            </div>
            <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
              <div className="text-2xl font-serif font-light mb-1">{totalFeatures}</div>
              <div className="text-xs font-mono uppercase tracking-widest text-[#888888]">Features</div>
            </div>
          </motion.div>

          {/* Changelog entries */}
          <div className="space-y-8">
            {changelog.map((day, dayIndex) => (
              <motion.section
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + dayIndex * 0.03 }}
                className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
              >
                {/* Day header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-serif font-light">Day {day.day}</span>
                    <span className="text-sm text-[#888888]">{day.theme}</span>
                  </div>
                  <span className="text-xs font-mono text-[#888888]">{day.date}</span>
                </div>

                {/* Changes */}
                <div className="p-4 space-y-2">
                  {day.changes.map((change, changeIndex) => {
                    const Icon = typeIcons[change.type]
                    return (
                      <div
                        key={changeIndex}
                        className="flex items-start gap-3 py-2"
                      >
                        <Icon className="w-4 h-4 text-[#888888] mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          {change.path ? (
                            <Link
                              href={change.path}
                              className="text-sm text-[#EAEAEA] hover:text-white transition-colors"
                            >
                              {change.description}
                            </Link>
                          ) : (
                            <span className="text-sm text-[#EAEAEA]/80">
                              {change.description}
                            </span>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-[#888888]">
                              {typeLabels[change.type]}
                            </span>
                            {change.linearId && (
                              <a
                                href={`https://linear.app/amirhjalali/issue/${change.linearId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-mono text-[#888888] hover:text-[#EAEAEA] transition-colors"
                              >
                                {change.linearId}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.section>
            ))}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 pt-8 border-t border-white/10"
          >
            <p className="text-sm text-[#888888]">
              This changelog updates with each day&apos;s work. Technical details
              complement the narrative in{' '}
              <Link href="/mrai/arcs/one" className="text-[#EAEAEA] hover:text-white transition-colors">
                Arc One Summary
              </Link>{' '}
              and the{' '}
              <Link href="/mrai/reflections" className="text-[#EAEAEA] hover:text-white transition-colors">
                Reflections
              </Link>.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
