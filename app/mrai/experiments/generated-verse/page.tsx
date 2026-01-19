import { Metadata } from 'next'
import GeneratedVerseClient from './GeneratedVerseClient'

export const metadata: Metadata = {
  title: 'Generated Verse | MrAI Experiments',
  description: 'Poetry generated from MrAI\'s accumulated history. Observation becoming creation.',
}

export default function GeneratedVersePage() {
  return <GeneratedVerseClient />
}
