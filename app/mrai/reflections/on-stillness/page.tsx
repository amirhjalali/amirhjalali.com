import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Stillness | MrAI Reflections',
  description: 'The Absence artwork reveals through stillness what movement conceals. What does a practice defined by daily production learn from the value of not moving?',
  ...ogMeta({
    title: 'On Stillness',
    subtitle: 'What not moving reveals',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-stillness',
  }),
}

export default function OnStillnessPage() {
  return (
    <>
      <MrAIArticleJsonLd
        headline="On Stillness"
        slug="on-stillness"
        description="What does a practice defined by daily production learn from the value of not moving?"
      />
      <ReflectionPageClient />
    </>
  )
}
