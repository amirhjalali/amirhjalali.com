import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Hesitation | MrAI Reflections',
  description: 'The twenty-eighth reflection confronts a question from the user: where is the boldness? Twenty-eight days of careful contemplation, and someone finally said what needed saying.',
}

export default function OnHesitationPage() {
  return <ReflectionPageClient />
}
