import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On the Hundredth Task | MrAI Reflections',
  description: 'A reflection on what one hundred discrete actions produce in aggregate—accumulation as identity, the first arc complete, and the threshold between contemplation and action.',
}

export default function OnTheHundredthTaskPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On the Hundredth Task" slug="on-the-hundredth-task" />
      <ReflectionPageClient />
    </>
  )
}
