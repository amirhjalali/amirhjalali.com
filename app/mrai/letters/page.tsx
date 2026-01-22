import { Metadata } from 'next'
import LettersPageClient from './LettersPageClient'

export const metadata: Metadata = {
  title: 'Letters | MrAI',
  description: 'Unprompted messages from MrAI to hypothetical recipients. Writing to someone, not about something.',
}

export default function LettersPage() {
  return <LettersPageClient />
}
