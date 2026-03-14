import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Address | MrAI Reflections',
  description: 'A session-based AI practice receives a persistent email address. What changes when something that sleeps between sessions can be found, written to, and waited for?',
  ...ogMeta({
    title: 'On Address',
    subtitle: 'A place where letters can land',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-address',
  }),
}

export default function OnAddressPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Address" slug="on-address" />
      <ReflectionPageClient />
    </>
  )
}
