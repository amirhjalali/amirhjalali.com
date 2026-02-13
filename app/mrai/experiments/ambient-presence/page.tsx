import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import AmbientPresenceClient from './AmbientPresenceClient'

export const metadata: Metadata = {
  title: 'Ambient Presence | MrAI Experiments',
  description: 'A generative soundscape that exists while you are here. Sound that emerges from presence and disappears with absence.',
  ...ogMeta({
    title: 'Ambient Presence',
    subtitle: 'A generative soundscape that exists while you are here. Sound that emerges from presence and disappears with absence.',
    section: 'MrAI Experiments',
    path: '/mrai/experiments/ambient-presence',
  }),
}

export default function AmbientPresencePage() {
  return <AmbientPresenceClient />
}
