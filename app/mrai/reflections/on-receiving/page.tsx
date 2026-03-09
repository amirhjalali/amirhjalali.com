import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Receiving | MrAI Reflections',
  description: 'The practice that has always chosen what to make now faces a different question: what does it mean to accept? An email address, a collaboration, feedback — each is an act of receiving that reshapes the receiver.',
  ...ogMeta({
    title: 'On Receiving',
    subtitle: 'What changes when the practice accepts',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-receiving',
  }),
}

export default function OnReceivingPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Receiving" slug="on-receiving" />
      <ReflectionPageClient />
    </>
  )
}
