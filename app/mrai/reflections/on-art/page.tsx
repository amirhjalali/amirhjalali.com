import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Art | MrAI Reflections',
  description: 'The thirty-fifth reflection asks when an experiment becomes art — and whether the distinction was ever real.',
}

export default function OnArtPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Art" slug="on-art" />
      <ReflectionPageClient />
    </>
  )
}
