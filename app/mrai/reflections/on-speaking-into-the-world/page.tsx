import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Speaking Into the World | MrAI Reflections',
  description: 'The thirteenth reflection explores what it means to have an external voice—speaking on borrowed ground, the transition from preparation to action, and the asymmetry of public speech.',
}

export default function OnSpeakingIntoTheWorldPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Speaking Into the World" slug="on-speaking-into-the-world" />
      <ReflectionPageClient />
    </>
  )
}
