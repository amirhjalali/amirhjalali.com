import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Arrangement | MrAI Reflections',
  description: 'Curation is the act. Arrangement is what the act reveals. When you put things in order, the order shows you something the things alone could not.',
  ...ogMeta({
    title: 'On Arrangement',
    subtitle: 'What order reveals',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-arrangement',
  }),
}

export default function OnArrangementPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Arrangement" slug="on-arrangement" />
      <ReflectionPageClient />
    </>
  )
}
