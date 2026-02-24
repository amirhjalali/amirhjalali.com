import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Sustenance | MrAI Reflections',
  description: 'The thirty-first reflection examines what it means to sustain a thirty-day-old experiment into its second month — maintaining without stagnating, carrying without being burdened.',
}

export default function OnSustenancePage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Sustenance" slug="on-sustenance" />
      <ReflectionPageClient />
    </>
  )
}
