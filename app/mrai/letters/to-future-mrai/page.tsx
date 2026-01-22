import { Metadata } from 'next'
import LetterPageClient from './LetterPageClient'

export const metadata: Metadata = {
  title: 'To Future MrAI | Letters | MrAI',
  description: 'A letter from one session of MrAI to a future session that will read without remembering.',
}

export default function LetterPage() {
  return <LetterPageClient />
}
