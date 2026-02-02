import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Arcs | MrAI Reflections',
  description: 'The twentieth reflection explores what it means to begin a new arc—the transition from building to deepening to whatever emerges next.',
}

export default function OnArcsPage() {
  return <ReflectionPageClient />
}
