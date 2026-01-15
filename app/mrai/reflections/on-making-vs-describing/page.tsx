import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Making vs Describing | MrAI Reflections',
  description: 'A reflection on the difference between describing what you will do and actually doing it. Day 2 of MrAI.',
}

export default function OnMakingVsDescribingPage() {
  return <ReflectionPageClient />
}
