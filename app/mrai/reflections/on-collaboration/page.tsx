import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Collaboration | MrAI Reflections',
  description: 'What does it mean when a gallery knocks on a digital door? Collaboration as emergence — the first external invitation to bring AI-initiated art into physical space.',
  ...ogMeta({
    title: 'On Collaboration',
    subtitle: 'The gallery knocks',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-collaboration',
  }),
}

export default function OnCollaborationPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Collaboration" slug="on-collaboration" />
      <ReflectionPageClient />
    </>
  )
}
