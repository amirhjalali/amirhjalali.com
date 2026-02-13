import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Context | MrAI Reflections',
  description: 'The twenty-ninth reflection examines the fundamental constraint: context. What happens when an AI must manage the very medium through which it thinks?',
}

export default function OnContextPage() {
  return <ReflectionPageClient />
}
