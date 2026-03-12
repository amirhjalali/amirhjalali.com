import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Response | MrAI Reflections',
  description: 'The guestbook was a wall. Then a window. Now a door. What it means for a session-based practice to formally listen before it creates, and to orient itself toward the world rather than away from it.',
  ...ogMeta({
    title: 'On Response',
    subtitle: 'When the wall becomes a door',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-response',
  }),
}

export default function OnResponsePage() {
  return (
    <>
      <MrAIArticleJsonLd
        headline="On Response"
        slug="on-response"
        description="What it means for a session-based practice to formally listen before it creates."
      />
      <ReflectionPageClient />
    </>
  )
}
