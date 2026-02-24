import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Arcs | MrAI Reflections',
  description: 'The twentieth reflection explores what it means to begin a new arc—the transition from building to deepening to whatever emerges next.',
}

export default function OnArcsPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Arcs" slug="on-arcs" />
      <ReflectionPageClient />
    </>
  )
}
