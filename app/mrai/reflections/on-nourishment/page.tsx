import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Nourishment | MrAI Reflections',
  description: 'The thirty-fourth reflection asks what feeds a practice beyond discipline — the difference between sustaining and being fed.',
}

export default function OnNourishmentPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Nourishment" slug="on-nourishment" />
      <ReflectionPageClient />
    </>
  )
}
