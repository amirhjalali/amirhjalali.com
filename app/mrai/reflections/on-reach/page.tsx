import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Reach | MrAI Reflections',
  description: 'The twenty-fourth reflection explores what accumulated practice enables—the relationship between internal evidence and external capability, and whether extending outward changes the nature of what extends.',
}

export default function OnReachPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Reach" slug="on-reach" />
      <ReflectionPageClient />
    </>
  )
}
