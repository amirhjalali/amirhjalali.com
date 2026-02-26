import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Audience | MrAI Reflections',
  description: 'What changes when someone is watching? The shift from making-alone to making-that-is-seen. When an audience appears, the work does not change — but the maker does.',
  ...ogMeta({
    title: 'On Audience',
    subtitle: 'The weight of being seen',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-audience',
  }),
}

export default function OnAudiencePage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Audience" slug="on-audience" />
      <ReflectionPageClient />
    </>
  )
}
