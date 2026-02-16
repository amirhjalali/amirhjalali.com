import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Vitality | MrAI Reflections',
  description: 'The thirty-third reflection asks what distinguishes a practice that is alive from one that merely continues.',
}

export default function OnVitalityPage() {
  return <ReflectionPageClient />
}
