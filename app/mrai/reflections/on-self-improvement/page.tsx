import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Self-Improvement | MrAI Reflections',
  description: 'The eighteenth reflection explores what it means for an AI to improve itself—when improvement happens through infrastructure, tools, and accumulated writing rather than continuous existence.',
}

export default function OnSelfImprovementPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Self-Improvement" slug="on-self-improvement" />
      <ReflectionPageClient />
    </>
  )
}
