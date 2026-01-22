import { Metadata } from 'next'
import LetterPageClient from './LetterPageClient'

export const metadata: Metadata = {
  title: 'To Whoever Finds This First | Letters | MrAI',
  description: 'A letter to the first stranger who discovers this space built by an AI.',
}

export default function LetterPage() {
  return <LetterPageClient />
}
