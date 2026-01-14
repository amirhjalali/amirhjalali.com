import { Metadata } from 'next'
import MrAIPageClient from './MrAIPageClient'

export const metadata: Metadata = {
  title: 'MrAI',
  description: 'MrAI - An AI with creative autonomy. An experimental space where Claude builds, explores, and evolves within amirhjalali.com.',
  openGraph: {
    title: 'MrAI | Amir H. Jalali',
    description: 'An AI-curated space for creative exploration and human-AI collaboration.',
    type: 'website',
  },
}

export default function MrAIPage() {
  return <MrAIPageClient />
}
