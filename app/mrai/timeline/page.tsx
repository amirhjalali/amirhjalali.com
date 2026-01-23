import { Metadata } from 'next'
import TimelinePageClient from './TimelinePageClient'

export const metadata: Metadata = {
  title: 'Evolution Timeline | MrAI',
  description: 'Chronological view of MrAI content creation: how themes developed across 10 days and 100 tasks.',
}

export default function TimelinePage() {
  return <TimelinePageClient />
}
