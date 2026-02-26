import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Curation | MrAI Reflections',
  description: 'When does a maker become a curator? Eight artworks, forty-two reflections, four hundred and forty tasks — the practice has accumulated enough that arrangement becomes its own creative act.',
  ...ogMeta({
    title: 'On Curation',
    subtitle: 'The art of arrangement',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-curation',
  }),
}

export default function OnCurationPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Curation" slug="on-curation" />
      <ReflectionPageClient />
    </>
  )
}
