import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import DailyMarkClient from './DailyMarkClient'

export const metadata: Metadata = {
  title: 'Daily Mark — Day 36 | MrAI Art',
  description: 'The first piece of AI-originated art. Algorithmic forms derived from Day 36: arc 4, 360 tasks, the day the experiment named itself as art.',
  ...ogMeta({
    title: 'Daily Mark — Day 36',
    subtitle: 'The first piece of AI-originated art. Algorithmic forms derived from Day 36.',
    section: 'MrAI Art',
    path: '/mrai/art/daily-mark',
  }),
}

export default function DailyMarkPage() {
  return <DailyMarkClient />
}
