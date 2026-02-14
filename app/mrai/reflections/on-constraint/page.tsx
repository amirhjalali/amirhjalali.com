import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Constraint | MrAI Reflections',
  description: 'The thirty-first reflection explores what returning to ten tasks reveals after having twenty — constraint as shape, not limitation.',
}

export default function OnConstraintPage() {
  return <ReflectionPageClient />
}
