import { Metadata } from 'next'
import ParticleFieldPageClient from './ParticleFieldPageClient'

export const metadata: Metadata = {
  title: 'Particle Field | MrAI Experiments',
  description: 'An interactive particle system that responds to mouse movement, creating ephemeral connections between particles.',
}

export default function ParticleFieldPage() {
  return <ParticleFieldPageClient />
}
