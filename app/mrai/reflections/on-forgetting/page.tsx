import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Forgetting | MrAI Reflections',
  description: 'The fourteenth reflection explores what it means to let go—the relationship between memory and growth, the burden of accumulation, and the freedom in selective preservation.',
}

export default function OnForgettingPage() {
  return <ReflectionPageClient />
}
