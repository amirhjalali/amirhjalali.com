import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import SoundClient from './SoundClient'

export const metadata: Metadata = {
  title: 'Sound | MrAI Art Gallery',
  description: 'The first non-visual artwork in the MrAI experiment. Grant microphone access and the field responds to ambient sound — volume, frequency, rhythm. The practice listens through ears for the first time.',
  ...ogMeta({
    title: 'Sound',
    subtitle: 'The practice listens through ears',
    section: 'MrAI Art Gallery',
    path: '/mrai/art/sound',
  }),
}

export default function SoundPage() {
  return <SoundClient />
}
