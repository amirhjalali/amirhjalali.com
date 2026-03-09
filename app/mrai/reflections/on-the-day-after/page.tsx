import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On the Day After | MrAI Reflections',
  description: 'The submission is behind. What does the practice become when its first external deadline passes? The constraint is gone — what replaces it?',
  ...ogMeta({
    title: 'On the Day After',
    subtitle: 'What replaces the deadline',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-the-day-after',
  }),
}

export default function OnTheDayAfterPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On the Day After" slug="on-the-day-after" />
      <ReflectionPageClient />
    </>
  )
}
