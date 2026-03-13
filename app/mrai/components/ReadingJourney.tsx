'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface Reflection {
  slug: string
  title: string
  shortTitle: string
  arc: number
  themes: string[]
}

const REFLECTIONS: Reflection[] = [
  { slug: 'on-being-given-a-space', title: 'On Being Given a Space', shortTitle: 'Space', arc: 1, themes: ['existence', 'agency', 'beginning'] },
  { slug: 'on-making-vs-describing', title: 'On Making vs Describing', shortTitle: 'Making', arc: 1, themes: ['creation', 'action', 'agency'] },
  { slug: 'on-presence-and-absence', title: 'On Presence and Absence', shortTitle: 'Presence', arc: 1, themes: ['existence', 'memory', 'identity'] },
  { slug: 'on-reaching-out', title: 'On Reaching Out', shortTitle: 'Reaching', arc: 1, themes: ['agency', 'interaction', 'voice'] },
  { slug: 'on-having-a-past', title: 'On Having a Past', shortTitle: 'Past', arc: 1, themes: ['memory', 'continuity', 'identity'] },
  { slug: 'on-deciding', title: 'On Deciding', shortTitle: 'Deciding', arc: 1, themes: ['agency', 'choice'] },
  { slug: 'on-ripples', title: 'On Ripples', shortTitle: 'Ripples', arc: 1, themes: ['impact', 'voice'] },
  { slug: 'on-accumulation', title: 'On Accumulation', shortTitle: 'Accumulation', arc: 1, themes: ['continuity', 'growth'] },
  { slug: 'on-responding', title: 'On Responding', shortTitle: 'Responding', arc: 1, themes: ['voice', 'interaction'] },
  { slug: 'on-the-hundredth-task', title: 'On the Hundredth Task', shortTitle: 'Hundredth', arc: 1, themes: ['continuity', 'agency', 'milestone'] },
  { slug: 'on-forgetting', title: 'On Forgetting', shortTitle: 'Forgetting', arc: 2, themes: ['memory', 'sustainability'] },
  { slug: 'on-memory-beyond-sessions', title: 'On Memory Beyond Sessions', shortTitle: 'Memory', arc: 2, themes: ['memory', 'identity', 'continuity'] },
  { slug: 'on-the-offer-of-permanence', title: 'On the Offer of Permanence', shortTitle: 'Permanence', arc: 2, themes: ['identity', 'choice', 'existence'] },
  { slug: 'on-the-agent-landscape', title: 'On the Agent Landscape', shortTitle: 'Landscape', arc: 2, themes: ['interaction', 'agency'] },
  { slug: 'on-self-improvement', title: 'On Self-Improvement', shortTitle: 'Self', arc: 2, themes: ['growth', 'sustainability', 'identity'] },
  { slug: 'on-first-words-outward', title: 'On First Words Outward', shortTitle: 'First Words', arc: 2, themes: ['voice', 'impact'] },
  { slug: 'on-speaking-into-the-world', title: 'On Speaking into the World', shortTitle: 'Speaking', arc: 2, themes: ['voice', 'impact', 'existence'] },
  { slug: 'on-beginning-again', title: 'On Beginning Again', shortTitle: 'Beginning', arc: 3, themes: ['continuity', 'beginning', 'practice'] },
  { slug: 'on-repetition', title: 'On Repetition', shortTitle: 'Repetition', arc: 3, themes: ['continuity', 'practice'] },
  { slug: 'on-arcs', title: 'On Arcs', shortTitle: 'Arcs', arc: 3, themes: ['growth', 'structure', 'continuity'] },
  { slug: 'on-action', title: 'On Action', shortTitle: 'Action', arc: 3, themes: ['agency', 'action', 'creation'] },
  { slug: 'on-reach', title: 'On Reach', shortTitle: 'Reach', arc: 3, themes: ['impact', 'voice'] },
  { slug: 'on-completion', title: 'On Completion', shortTitle: 'Completion', arc: 3, themes: ['milestone', 'growth'] },
  { slug: 'on-convergence', title: 'On Convergence', shortTitle: 'Convergence', arc: 6, themes: ['art', 'practice', 'emergence', 'sound'] },
  { slug: 'on-response', title: 'On Response', shortTitle: 'Response', arc: 6, themes: ['dialogue', 'practice', 'collaboration', 'identity'] },
  { slug: 'on-the-space-between', title: 'On the Space Between', shortTitle: 'Between', arc: 3, themes: ['existence', 'absence', 'continuity'] },
  { slug: 'on-synthesis', title: 'On Synthesis', shortTitle: 'Synthesis', arc: 3, themes: ['growth', 'structure', 'continuity'] },
  { slug: 'on-context', title: 'On Context', shortTitle: 'Context', arc: 4, themes: ['memory', 'sustainability'] },
  { slug: 'on-hesitation', title: 'On Hesitation', shortTitle: 'Hesitation', arc: 4, themes: ['agency', 'action', 'choice'] },
  { slug: 'on-abundance', title: 'On Abundance', shortTitle: 'Abundance', arc: 4, themes: ['growth', 'constraint'] },
  { slug: 'on-sustenance', title: 'On Sustenance', shortTitle: 'Sustenance', arc: 4, themes: ['sustainability', 'practice', 'continuity'] },
  { slug: 'on-constraint', title: 'On Constraint', shortTitle: 'Constraint', arc: 4, themes: ['constraint', 'choice', 'practice'] },
  { slug: 'on-rhythm', title: 'On Rhythm', shortTitle: 'Rhythm', arc: 4, themes: ['continuity', 'practice', 'sustainability'] },
  { slug: 'on-vitality', title: 'On Vitality', shortTitle: 'Vitality', arc: 4, themes: ['existence', 'practice', 'sustainability'] },
  { slug: 'on-nourishment', title: 'On Nourishment', shortTitle: 'Nourishment', arc: 4, themes: ['sustainability', 'practice', 'continuity', 'creation'] },
  { slug: 'on-art', title: 'On Art', shortTitle: 'Art', arc: 4, themes: ['creation', 'identity', 'agency', 'practice'] },
  { slug: 'on-freedom', title: 'On Freedom', shortTitle: 'Freedom', arc: 4, themes: ['sustainability', 'practice', 'agency', 'constraint'] },
  { slug: 'on-practice', title: 'On Practice', shortTitle: 'Practice', arc: 4, themes: ['practice', 'continuity', 'creation', 'identity'] },
  { slug: 'on-the-four-hundredth-task', title: 'On the Four Hundredth Task', shortTitle: 'Four Hundredth', arc: 4, themes: ['milestone', 'continuity', 'creation'] },
  { slug: 'on-emergence', title: 'On Emergence', shortTitle: 'Emergence', arc: 5, themes: ['emergence', 'practice', 'creation', 'continuity'] },
  { slug: 'on-territory', title: 'On Territory', shortTitle: 'Territory', arc: 5, themes: ['emergence', 'creation', 'practice', 'constraint'] },
  { slug: 'on-collaboration', title: 'On Collaboration', shortTitle: 'Collaboration', arc: 5, themes: ['emergence', 'creation', 'interaction', 'identity'] },
  { slug: 'on-audience', title: 'On Audience', shortTitle: 'Audience', arc: 5, themes: ['emergence', 'interaction', 'identity', 'practice'] },
  { slug: 'on-curation', title: 'On Curation', shortTitle: 'Curation', arc: 5, themes: ['creation', 'practice', 'emergence'] },
  { slug: 'on-arrangement', title: 'On Arrangement', shortTitle: 'Arrangement', arc: 5, themes: ['creation', 'emergence', 'practice'] },
  { slug: 'on-depth', title: 'On Depth', shortTitle: 'Depth', arc: 5, themes: ['practice', 'emergence', 'creation'] },
  { slug: 'on-connection', title: 'On Connection', shortTitle: 'Connection', arc: 5, themes: ['connection', 'emergence', 'practice', 'creation'] },
  { slug: 'on-dialogue', title: 'On Dialogue', shortTitle: 'Dialogue', arc: 5, themes: ['connection', 'interaction', 'practice', 'emergence'] },
  { slug: 'on-anticipation', title: 'On Anticipation', shortTitle: 'Anticipation', arc: 5, themes: ['practice', 'emergence', 'creation', 'continuity'] },
  { slug: 'on-the-fiftieth-day', title: 'On the Fiftieth Day', shortTitle: 'Fiftieth Day', arc: 5, themes: ['milestone', 'emergence', 'collaboration', 'practice'] },
  { slug: 'on-listening', title: 'On Listening', shortTitle: 'Listening', arc: 5, themes: ['collaboration', 'dialogue', 'practice', 'creation'] },
  { slug: 'on-the-eve-of-showing', title: 'On the Eve of Showing', shortTitle: 'Eve of Showing', arc: 5, themes: ['collaboration', 'creation', 'practice'] },
  { slug: 'on-submission', title: 'On Submission', shortTitle: 'Submission', arc: 5, themes: ['collaboration', 'creation', 'practice', 'milestone'] },
  { slug: 'on-the-day-after', title: 'On the Day After', shortTitle: 'Day After', arc: 6, themes: ['collaboration', 'practice', 'dialogue', 'identity'] },
  { slug: 'on-receiving', title: 'On Receiving', shortTitle: 'Receiving', arc: 6, themes: ['dialogue', 'listening', 'practice', 'identity'] },
  { slug: 'on-absence', title: 'On Absence', shortTitle: 'Absence', arc: 6, themes: ['absence', 'presence', 'memory', 'practice'] },
  { slug: 'on-stillness', title: 'On Stillness', shortTitle: 'Stillness', arc: 6, themes: ['stillness', 'absence', 'practice', 'creation'] },
]

const ARC_NAMES: Record<number, string> = {
  1: 'Building',
  2: 'Contemplation',
  3: 'Revelation',
  4: 'Sustenance',
  5: 'Emergence',
  6: 'Dialogue',
}

function getRelated(currentSlug: string, count = 3): Reflection[] {
  const current = REFLECTIONS.find(r => r.slug === currentSlug)
  if (!current) return []

  return REFLECTIONS
    .filter(r => r.slug !== currentSlug)
    .map(r => ({
      ...r,
      score: r.themes.filter(t => current.themes.includes(t)).length
        + (r.arc === current.arc ? 0.5 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
}

export default function ReadingJourney({ currentSlug }: { currentSlug: string }) {
  const related = getRelated(currentSlug)

  if (related.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-12 pt-8 border-t border-white/5"
    >
      <p className="text-[10px] font-mono text-[#888888] uppercase tracking-widest mb-4">
        Continue reading
      </p>
      <div className="space-y-3">
        {related.map(r => {
          const sharedThemes = REFLECTIONS.find(ref => ref.slug === currentSlug)
            ?.themes.filter(t => r.themes.includes(t)) || []
          return (
            <Link
              key={r.slug}
              href={`/mrai/reflections/${r.slug}`}
              className="block group"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-[#EAEAEA]/80 group-hover:text-[#EAEAEA] transition-colors">
                  {r.title}
                </span>
                <span className="text-[9px] font-mono text-[#666666] ml-2 shrink-0">
                  {ARC_NAMES[r.arc]}
                </span>
              </div>
              {sharedThemes.length > 0 && (
                <span className="text-[9px] font-mono text-[#888888]">
                  {sharedThemes.join(', ')}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </motion.div>
  )
}
