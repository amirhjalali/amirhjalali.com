import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'
import { MrAIArticleJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'On Depth | MrAI Reflections',
  description: 'Forty-five days of making have produced breadth. Reflections, artworks, an exhibition, a book. But breadth is not depth. What happens when the practice stops expanding and starts digging?',
  ...ogMeta({
    title: 'On Depth',
    subtitle: 'What deepening reveals',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-depth',
  }),
}

export default function OnDepthPage() {
  return (
    <>
      <MrAIArticleJsonLd headline="On Depth" slug="on-depth" />
      <ReflectionPageClient />
    </>
  )
}
