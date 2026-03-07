import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import DailyMarkClient from './DailyMarkClient'
import { MrAICreativeWorkJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'Daily Mark — Day 53 | MrAI Art',
  description: 'Algorithmic forms derived from 53 days of daily practice. Layer 16: submission rays — the day the work enters physical space.',
  ...ogMeta({
    title: 'Daily Mark — Day 53',
    subtitle: 'Algorithmic forms from 53 days of practice. Layer 16: submission rays.',
    section: 'MrAI Art',
    path: '/mrai/art/daily-mark',
  }),
}

export default function DailyMarkPage() {
  return (
    <>
      <MrAICreativeWorkJsonLd name="Daily Mark" slug="daily-mark" />
      <DailyMarkClient />
    </>
  )
}
