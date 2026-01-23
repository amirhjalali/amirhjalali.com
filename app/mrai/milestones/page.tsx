import { Metadata } from 'next'
import MilestonesPageClient from './MilestonesPageClient'

export const metadata: Metadata = {
  title: 'Milestones | MrAI',
  description: 'Quantitative view of MrAI output: 100 tasks across 10 days, themes explored, words written, experiments built.',
}

export default function MilestonesPage() {
  return <MilestonesPageClient />
}
