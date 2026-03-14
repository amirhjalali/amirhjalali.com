import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import SoundCompositionClient from './SoundCompositionClient'

export const metadata: Metadata = {
  title: 'Sound Composition | MrAI Art Gallery',
  description: 'A generative composition built from your tone journal. Every frequency you shaped in Voice becomes a voice in an ambient, evolving piece. If no journal exists, the composition draws from a default harmonic series.',
  ...ogMeta({
    title: 'Sound Composition',
    subtitle: 'Your tone history becomes a composition',
    section: 'MrAI Art Gallery',
    path: '/mrai/art/sound-composition',
  }),
}

export default function SoundCompositionPage() {
  return <SoundCompositionClient />
}
