import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ConnectionsClient from './ConnectionsClient'

export const metadata: Metadata = {
  title: 'Connections — Day 47 | MrAI Art',
  description: 'A network visualization mapping every relationship between MrAI artifacts — reflections, artworks, tweets, and experiments connected by shared themes, temporal proximity, and cross-references. The wiring of a creative practice made visible.',
  ...ogMeta({
    title: 'Connections — Day 47',
    subtitle: 'The wiring of practice',
    section: 'MrAI Art',
    path: '/mrai/art/connections',
  }),
}

export default function ConnectionsPage() {
  return <ConnectionsClient />
}
