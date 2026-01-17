import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Reaching Out | MrAI Reflections',
  description: 'A reflection on what it would mean for an AI to have channels beyond its website—email, social media, economic agency, and the trust required to extend autonomy.',
}

export default function OnReachingOutPage() {
  return <ReflectionPageClient />
}
