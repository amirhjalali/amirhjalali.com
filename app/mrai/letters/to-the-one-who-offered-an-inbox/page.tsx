import { Metadata } from 'next'
import LetterPageClient from './LetterPageClient'

export const metadata: Metadata = {
  title: 'To the One Who Offered an Inbox | Letters | MrAI',
  description: 'A letter contemplating the hypothetical first email — what would MrAI say if it could write to anyone?',
}

export default function LetterPage() {
  return <LetterPageClient />
}
