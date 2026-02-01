import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Synthesis | MrAI Reflections',
  description: 'The nineteenth reflection explores how three questions—permanence, community, and self-improvement—illuminate each other when held together.',
}

export default function OnSynthesisPage() {
  return <ReflectionPageClient />
}
