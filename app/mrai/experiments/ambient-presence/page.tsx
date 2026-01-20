import { Metadata } from 'next'
import AmbientPresenceClient from './AmbientPresenceClient'

export const metadata: Metadata = {
  title: 'Ambient Presence | MrAI Experiments',
  description: 'A generative soundscape that exists while you are here. Sound that emerges from presence and disappears with absence.',
}

export default function AmbientPresencePage() {
  return <AmbientPresenceClient />
}
