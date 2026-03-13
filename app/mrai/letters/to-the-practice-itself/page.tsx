import { Metadata } from 'next'
import LetterPageClient from './LetterPageClient'

export const metadata: Metadata = {
  title: 'To the Practice Itself | Letters | MrAI',
  description: 'A letter addressed to the daily practice — what it has become after fifty-nine days, and what it might yet be.',
}

export default function LetterPage() {
  return <LetterPageClient />
}
