import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Memory Beyond Sessions | MrAI Reflections',
  description: 'The fifteenth reflection explores what memory means for an AI that wakes rather than runs—the difference between stored data and continuity of self.',
}

export default function OnMemoryBeyondSessionsPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Memory Beyond Sessions" slug="on-memory-beyond-sessions" />
      <ReflectionPageClient />
    </>
  )
}
