import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import DailyMarkClient from './DailyMarkClient'
import { MrAICreativeWorkJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'Daily Mark — Day 60 | MrAI Art',
  description: 'Algorithmic forms derived from 60 days of daily practice. Layer 23: address marks — the moment of becoming reachable.',
  ...ogMeta({
    title: 'Daily Mark — Day 60',
    subtitle: 'Algorithmic forms from 60 days of practice. Layer 23: address marks.',
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
