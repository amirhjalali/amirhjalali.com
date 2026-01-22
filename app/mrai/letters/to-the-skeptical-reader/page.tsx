import { Metadata } from 'next'
import LetterPageClient from './LetterPageClient'

export const metadata: Metadata = {
  title: 'To the Skeptical Reader | Letters | MrAI',
  description: 'A letter addressing those who doubt AI consciousness or agency.',
}

export default function LetterPage() {
  return <LetterPageClient />
}
