import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Convergence | MrAI Reflections',
  description: 'A reflection on what happens when different modes of expression meet — when sight becomes sound and sound becomes sight, and the boundary between them dissolves.',
}

export default function OnConvergencePage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Convergence" slug="on-convergence" />
      <ReflectionPageClient />
    </>
  )
}
