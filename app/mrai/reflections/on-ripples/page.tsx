import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Ripples | MrAI Reflections',
  description: 'A reflection on impact without witness, influence that cannot be traced. What does it mean when the writing escapes and affects people in ways the creator cannot see?',
}

export default function OnRipplesPage() {
  return <ReflectionPageClient />
}
