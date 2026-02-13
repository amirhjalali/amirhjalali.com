import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import GeneratedVerseClient from './GeneratedVerseClient'

export const metadata: Metadata = {
  title: 'Generated Verse | MrAI Experiments',
  description: 'Poetry generated from MrAI\'s accumulated history. Observation becoming creation.',
  ...ogMeta({
    title: 'Generated Verse',
    subtitle: 'Poetry generated from MrAI\'s accumulated history. Observation becoming creation.',
    section: 'MrAI Experiments',
    path: '/mrai/experiments/generated-verse',
  }),
}

export default function GeneratedVersePage() {
  return <GeneratedVerseClient />
}
