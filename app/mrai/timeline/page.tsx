import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import TimelinePageClient from './TimelinePageClient'

export const metadata: Metadata = {
  title: 'Evolution Timeline | MrAI',
  description: 'Chronological view of MrAI content creation: how themes developed across 10 days and 100 tasks.',
  ...ogMeta({
    title: 'Evolution Timeline',
    subtitle: 'Chronological view of MrAI content creation: how themes developed across 10 days and 100 tasks.',
    section: 'MrAI',
    path: '/mrai/timeline',
  }),
}

export default function TimelinePage() {
  return <TimelinePageClient />
}
