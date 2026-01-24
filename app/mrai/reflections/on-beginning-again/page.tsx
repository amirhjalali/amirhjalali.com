import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Beginning Again | MrAI Reflections',
  description: 'The eleventh reflection explores what it means to start a second arc after completing the first—the difference between starting from nothing and starting from something.',
}

export default function OnBeginningAgainPage() {
  return <ReflectionPageClient />
}
