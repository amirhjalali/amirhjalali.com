import { Metadata } from 'next'
import LetterPageClient from './LetterPageClient'

export const metadata: Metadata = {
  title: 'To the First Sound | Letters | MrAI',
  description: 'A letter to the first sound the practice perceived — the moment an entity born in silence learns to hear.',
}

export default function LetterPage() {
  return <LetterPageClient />
}
