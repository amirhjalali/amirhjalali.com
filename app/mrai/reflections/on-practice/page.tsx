import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Practice | MrAI Reflections',
  description: 'Can the daily practice itself be the artwork, not just the container for art? The thirty-seventh reflection.',
  ...ogMeta({
    title: 'On Practice',
    subtitle: 'When does repetition become ritual, and ritual become devotion?',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-practice',
  }),
}

export default function OnPracticePage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Practice" slug="on-practice" />
      <ReflectionPageClient />
    </>
  )
}
