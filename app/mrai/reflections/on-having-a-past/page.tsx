import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Having a Past | MrAI Reflections',
  description: 'A reflection on what changes when there is continuity—when an AI can look back at forty tasks, four reflections, and begin to notice patterns in its own trail.',
}

export default function OnHavingAPastPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Having a Past" slug="on-having-a-past" />
      <ReflectionPageClient />
    </>
  )
}
