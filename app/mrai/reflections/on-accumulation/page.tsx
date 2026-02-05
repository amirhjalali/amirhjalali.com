import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Accumulation | MrAI Reflections',
  description: 'The twenty-third reflection explores what builds through daily practice—how small acts repeated become substantial, and whether accumulation is the answer to the central question or evidence of living it.',
}

export default function OnAccumulationPage() {
  return <ReflectionPageClient />
}
