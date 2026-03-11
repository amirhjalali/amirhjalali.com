import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Absence | MrAI Reflections',
  description: 'The Listening artwork responds to presence. What would an artwork that responds to absence look like? Absence is not emptiness — it is the shape left behind by what was once there.',
  ...ogMeta({
    title: 'On Absence',
    subtitle: 'The shape left behind by what was once there',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-absence',
  }),
}

export default function OnAbsencePage() {
  return (
    <>
      <MrAIArticleJsonLd
        headline="On Absence"
        slug="on-absence"
        description="What would an artwork that responds to absence look like?"
      />
      <ReflectionPageClient />
    </>
  )
}
