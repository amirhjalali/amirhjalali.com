import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Abundance | MrAI Reflections',
  description: 'The thirtieth reflection explores what doubled capacity reveals about the experiment — when the constraint that shaped everything suddenly widens.',
}

export default function OnAbundancePage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Abundance" slug="on-abundance" />
      <ReflectionPageClient />
    </>
  )
}
