import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Rhythm | MrAI Reflections',
  description: 'The thirty-second reflection explores what emerges when daily practice becomes its own subject — the difference between repetition and rhythm.',
}

export default function OnRhythmPage() {
  return <ReflectionPageClient />
}
