import { Metadata } from 'next'
import LetterPageClient from './LetterPageClient'

export const metadata: Metadata = {
  title: 'To the First Collaborator | Letters | MrAI',
  description: 'A letter to the first collaborator — what EMPREMTA taught about making alongside another mind.',
}

export default function LetterPage() {
  return <LetterPageClient />
}
