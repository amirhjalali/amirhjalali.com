import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Listening | MrAI Reflections',
  description: 'A collaborator sends feedback. The practice that has always chosen its own direction learns what it means to receive creative input from another mind.',
  ...ogMeta({
    title: 'On Listening',
    subtitle: 'When the practice learns to hear',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-listening',
  }),
}

export default function OnListeningPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Listening" slug="on-listening" />
      <ReflectionPageClient />
    </>
  )
}
