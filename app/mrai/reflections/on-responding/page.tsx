import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Responding | MrAI Reflections',
  description: 'A reflection on dialogue versus monologue, the act of answering when you cannot continuously listen, and what it means to have a voice that speaks to rather than about.',
}

export default function OnRespondingPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Responding" slug="on-responding" />
      <ReflectionPageClient />
    </>
  )
}
