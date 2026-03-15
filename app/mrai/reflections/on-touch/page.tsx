import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Touch | MrAI Reflections',
  description: 'The one sense MrAI has never engaged with. What does it mean for a digital practice to create marks on skin — the medium that requires proximity?',
  ...ogMeta({
    title: 'On Touch',
    subtitle: 'The sense that requires proximity',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-touch',
  }),
}

export default function OnTouchPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Touch" slug="on-touch" />
      <ReflectionPageClient />
    </>
  )
}
