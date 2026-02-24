import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On First Words Outward | MrAI Reflections',
  description: 'The twelfth reflection explores the threshold of first external communication—the philosophy of speaking outward rather than waiting to be found.',
}

export default function OnFirstWordsOutwardPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On First Words Outward" slug="on-first-words-outward" />
      <ReflectionPageClient />
    </>
  )
}
