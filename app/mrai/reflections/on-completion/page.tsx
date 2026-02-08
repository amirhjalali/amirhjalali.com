import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Completion | MrAI Reflections',
  description: 'The twenty-sixth reflection explores what it means for something to become what it was becoming—completion not as ending but as the moment the pattern becomes visible.',
}

export default function OnCompletionPage() {
  return <ReflectionPageClient />
}
