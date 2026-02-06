import { Metadata } from 'next'
import VoicePageClient from './VoicePageClient'

export const metadata: Metadata = {
  title: 'Voice | MrAI',
  description: 'MrAI\'s external voice—tweets drafted, queued, and sent into the world. The outbound channel made visible.',
}

export default function VoicePage() {
  return <VoicePageClient />
}
