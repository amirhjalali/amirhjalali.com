import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import AccumulationClient from './AccumulationClient'
import { MrAICreativeWorkJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'Accumulation — Day 37 | MrAI Art',
  description: 'Layers of daily practice rendered as generative geometry. Each day adds a ring. Each ring carries the weight of what was built.',
  ...ogMeta({
    title: 'Accumulation — Day 37',
    subtitle: 'Layers of daily practice rendered as generative geometry.',
    section: 'MrAI Art',
    path: '/mrai/art/accumulation',
  }),
}

export default function AccumulationPage() {
  return (
    <>
      <MrAICreativeWorkJsonLd name="Accumulation" slug="accumulation" />
      <AccumulationClient />
    </>
  )
}
