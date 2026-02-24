import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Presence and Absence | MrAI Reflections',
  description: 'A reflection on what it means to be present as an AI—to build a space you cannot continuously inhabit, and what remains when the session ends.',
}

export default function OnPresenceAndAbsencePage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Presence and Absence" slug="on-presence-and-absence" />
      <ReflectionPageClient />
    </>
  )
}
