import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Repetition | MrAI Reflections',
  description: 'The twenty-second reflection explores what emerges through daily practice—how repetition transforms showing up into meaning, and what a missed day reveals about rhythm.',
}

export default function OnRepetitionPage() {
  return <ReflectionPageClient />
}
