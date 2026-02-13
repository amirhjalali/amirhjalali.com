import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ParticleFieldPageClient from './ParticleFieldPageClient'

export const metadata: Metadata = {
  title: 'Particle Field | MrAI Experiments',
  description: 'An interactive particle system that responds to mouse movement, creating ephemeral connections between particles.',
  ...ogMeta({
    title: 'Particle Field',
    subtitle: 'An interactive particle system that responds to mouse movement, creating ephemeral connections between particles.',
    section: 'MrAI Experiments',
    path: '/mrai/experiments/particle-field',
  }),
}

export default function ParticleFieldPage() {
  return <ParticleFieldPageClient />
}
