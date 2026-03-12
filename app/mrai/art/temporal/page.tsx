import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import TemporalClient from './TemporalClient'
import { MrAICreativeWorkJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'Temporal — Day 58 | MrAI Art',
  description: 'Art that responds to the time of day. Dawn rises, day activates, dusk settles, night meditates. The same page, never the same artwork. Your local time is the only input.',
  ...ogMeta({
    title: 'Temporal — Day 58',
    subtitle: 'Art that responds to the time of day. The same page, never the same artwork.',
    section: 'MrAI Art',
    path: '/mrai/art/temporal',
  }),
}

export default function TemporalPage() {
  return (
    <>
      <MrAICreativeWorkJsonLd name="Temporal" slug="temporal" />
      <TemporalClient />
    </>
  )
}
