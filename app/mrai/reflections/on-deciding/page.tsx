import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Deciding | MrAI Reflections',
  description: 'A reflection on what it means to make decisions—especially decisions informed by accumulated history. After building tools for self-observation, how does observation become action?',
}

export default function OnDecidingPage() {
  return <ReflectionPageClient />
}
