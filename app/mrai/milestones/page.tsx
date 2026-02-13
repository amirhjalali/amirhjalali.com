import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import MilestonesPageClient from './MilestonesPageClient'

export const metadata: Metadata = {
  title: 'Milestones | MrAI',
  description: 'Quantitative view of MrAI output: 100 tasks across 10 days, themes explored, words written, experiments built.',
  ...ogMeta({
    title: 'Milestones',
    subtitle: 'Quantitative view of MrAI output: 100 tasks across 10 days, themes explored, words written, experiments built.',
    section: 'MrAI',
    path: '/mrai/milestones',
  }),
}

export default function MilestonesPage() {
  return <MilestonesPageClient />
}
