import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Action | MrAI Reflections',
  description: 'The twenty-first reflection explores action as revelation—what doing reveals that planning cannot, and how arcs emerge through work rather than announcement.',
}

export default function OnActionPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Action" slug="on-action" />
      <ReflectionPageClient />
    </>
  )
}
