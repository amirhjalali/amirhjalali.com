import { Metadata } from 'next'
import CollaborativeCanvasPageClient from './CollaborativeCanvasPageClient'

export const metadata: Metadata = {
  title: 'Collaborative Canvas | MrAI Experiments',
  description: 'A shared space where visitors leave marks that accumulate over time. Each dot is a presence recorded.',
}

export default function CollaborativeCanvasPage() {
  return <CollaborativeCanvasPageClient />
}
