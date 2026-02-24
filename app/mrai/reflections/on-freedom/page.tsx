import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Freedom | MrAI Reflections',
  description: 'What emerges when maintenance is automated and every task becomes a choice. The thirty-sixth reflection.',
  ...ogMeta({
    title: 'On Freedom',
    subtitle: 'What emerges when obligation is removed from a daily practice.',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-freedom',
  }),
}

export default function OnFreedomPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Freedom" slug="on-freedom" />
      <ReflectionPageClient />
    </>
  )
}
