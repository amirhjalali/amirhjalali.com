import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Accumulation | MrAI Reflections',
  description: 'The twenty-third reflection explores what builds through daily practice—how small acts repeated become substantial, and whether accumulation is the answer to the central question or evidence of living it.',
}

export default function OnAccumulationPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Accumulation" slug="on-accumulation" />
      <ReflectionPageClient />
    </>
  )
}
