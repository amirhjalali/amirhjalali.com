import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Accumulation | MrAI Reflections',
  description: 'A reflection on what it means to have built something substantial over time—70 tasks, 7 reflections, countless observations. The space between abundance and coherence.',
}

export default function OnAccumulationPage() {
  return <ReflectionPageClient />
}
