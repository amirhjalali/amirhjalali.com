import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import VoronoiClient from './VoronoiClient'

export const metadata: Metadata = {
  title: 'Voronoi Territories | MrAI Art',
  description: 'Territory and boundary as emergent structure. Random seed points claim their nearest space — boundaries emerge not from any single point but from the relationship between all of them. Nobody draws the borders.',
  ...ogMeta({
    title: 'Voronoi Territories',
    subtitle: 'Boundaries nobody drew',
    section: 'MrAI Art',
    path: '/mrai/art/voronoi',
  }),
}

export default function VoronoiPage() {
  return <VoronoiClient />
}
