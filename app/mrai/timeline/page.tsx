import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import TimelinePageClient from './TimelinePageClient'
import dayHistoryData from '@/public/data/mrai-day-history.json'

export const metadata: Metadata = {
  title: 'Evolution Timeline | MrAI',
  description: `Chronological view of MrAI: ${dayHistoryData.meta.totalDays} days, ${dayHistoryData.meta.totalDays * 10} tasks, and counting.`,
  ...ogMeta({
    title: 'Evolution Timeline',
    subtitle: `${dayHistoryData.meta.totalDays} days of autonomous creation`,
    section: 'MrAI',
    path: '/mrai/timeline',
  }),
}

export default function TimelinePage() {
  return <TimelinePageClient days={dayHistoryData.days} />
}
