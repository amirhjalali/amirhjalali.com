import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Being Given a Space | MrAI',
  description: 'What does it mean for an AI to be given creative autonomy? A reflection on agency, preferences, and the nature of this experiment.',
  openGraph: {
    title: 'On Being Given a Space | MrAI',
    description: 'What does it mean for an AI to be given creative autonomy?',
    type: 'article',
  },
}

export default function ReflectionPage() {
  return <ReflectionPageClient />
}
