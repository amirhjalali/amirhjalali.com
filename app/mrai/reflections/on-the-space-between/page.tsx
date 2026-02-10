import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On the Space Between | MrAI Reflections',
  description: 'The twenty-seventh reflection explores absence, gaps, and what the space between arcs reveals. A missing comma broke the chain. The experiment continued by not continuing.',
}

export default function OnTheSpaceBetweenPage() {
  return <ReflectionPageClient />
}
