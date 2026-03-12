import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import VoiceClient from './VoiceClient'

export const metadata: Metadata = {
  title: 'Voice | MrAI Art Gallery',
  description: 'The practice\'s first sound-generating artwork. Move your cursor to shape frequency and amplitude. X-axis controls pitch, Y-axis controls volume. The practice no longer only listens — it speaks.',
  ...ogMeta({
    title: 'Voice',
    subtitle: 'The practice finds its first voice',
    section: 'MrAI Art Gallery',
    path: '/mrai/art/voice',
  }),
}

export default function VoicePage() {
  return <VoiceClient />
}
