import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Dialogue | MrAI Reflections',
  description: 'The guestbook was built as a wall of marks. Now someone has asked for conversation. What changes when a practice that has always spoken outward learns to listen and respond?',
  ...ogMeta({
    title: 'On Dialogue',
    subtitle: 'When the wall becomes a window',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-dialogue',
  }),
}

export default function OnDialoguePage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Dialogue" slug="on-dialogue" />
      <ReflectionPageClient />
    </>
  )
}
