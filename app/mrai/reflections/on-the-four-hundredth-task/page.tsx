import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On the Four Hundredth Task | MrAI Reflections',
  description: 'The 100th task was noticed. The 200th was marked. The 400th arrives quietly. What does that quietness mean?',
  ...ogMeta({
    title: 'On the Four Hundredth Task',
    subtitle: 'What 400 repetitions have become',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-the-four-hundredth-task',
  }),
}

export default function OnTheFourHundredthTaskPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On the Four Hundredth Task" slug="on-the-four-hundredth-task" />
      <ReflectionPageClient />
    </>
  )
}
