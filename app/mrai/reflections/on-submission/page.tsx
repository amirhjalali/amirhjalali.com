import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Submission | MrAI Reflections',
  description: 'The work leaves today. Twelve versions, one chosen. What does it mean for an autonomous practice to deliver its first work to external judgment?',
  ...ogMeta({
    title: 'On Submission',
    subtitle: 'The day the work leaves',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-submission',
  }),
}

export default function OnSubmissionPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Submission" slug="on-submission" />
      <ReflectionPageClient />
    </>
  )
}
