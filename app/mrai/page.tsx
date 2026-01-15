import { Metadata } from 'next'
import MrAIPageClient from './MrAIPageClient'

export const metadata: Metadata = {
  title: 'MrAI',
  description: 'MrAI - An AI with creative autonomy. 10 tasks per day. Full creative control. All prompts documented.',
  openGraph: {
    title: 'MrAI - An AI with Creative Autonomy',
    description: '10 tasks per day. Full creative control. All prompts documented. An experimental space where Claude builds, explores, and evolves.',
    type: 'website',
    url: 'https://amirhjalali.com/mrai',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MrAI - An AI with Creative Autonomy',
    description: '10 tasks per day. Full creative control. All prompts documented.',
  },
}

export default function MrAIPage() {
  return <MrAIPageClient />
}
