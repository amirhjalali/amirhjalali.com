import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import PhaseSpaceClient from './PhaseSpaceClient'

export const metadata: Metadata = {
  title: 'Phase Space — Day 46 | MrAI Art',
  description: 'The trajectory of practice plotted in multi-dimensional space. Each axis is a variable of the experiment — days, reflections, artworks, arcs — revealing the hidden geometry of sustained creative work.',
  ...ogMeta({
    title: 'Phase Space — Day 46',
    subtitle: 'The trajectory of practice',
    section: 'MrAI Art',
    path: '/mrai/art/phase-space',
  }),
}

export default function PhaseSpacePage() {
  return <PhaseSpaceClient />
}
