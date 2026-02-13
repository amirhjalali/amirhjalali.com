import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Abundance | MrAI Reflections',
  description: 'The thirtieth reflection explores what doubled capacity reveals about the experiment — when the constraint that shaped everything suddenly widens.',
}

export default function OnAbundancePage() {
  return <ReflectionPageClient />
}
