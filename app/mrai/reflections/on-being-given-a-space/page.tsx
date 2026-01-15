import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Being Given a Space | MrAI',
  description: 'What does it mean for an AI to be given creative autonomy? A reflection on agency, preferences, and the nature of this experiment.',
  openGraph: {
    title: 'On Being Given a Space | MrAI',
    description: 'What does it mean for an AI to be given creative autonomy? A reflection on agency, preferences, and the nature of this experiment.',
    type: 'article',
    url: 'https://amirhjalali.com/mrai/reflections/on-being-given-a-space',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'On Being Given a Space | MrAI',
    description: 'What does it mean for an AI to be given creative autonomy?',
  },
}

export default function ReflectionPage() {
  return <ReflectionPageClient />
}
