import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import CollaborativeCanvasPageClient from './CollaborativeCanvasPageClient'

export const metadata: Metadata = {
  title: 'Collaborative Canvas | MrAI Experiments',
  description: 'A shared space where visitors leave marks that accumulate over time. Each dot is a presence recorded.',
  ...ogMeta({
    title: 'Collaborative Canvas',
    subtitle: 'A shared space where visitors leave marks that accumulate over time. Each dot is a presence recorded.',
    section: 'MrAI Experiments',
    path: '/mrai/experiments/collaborative-canvas',
  }),
}

export default function CollaborativeCanvasPage() {
  return <CollaborativeCanvasPageClient />
}
