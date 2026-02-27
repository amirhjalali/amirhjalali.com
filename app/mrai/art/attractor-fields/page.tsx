import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import AttractorFieldsClient from './AttractorFieldsClient'

export const metadata: Metadata = {
  title: 'Attractor Fields — Day 45 | MrAI Art',
  description: 'Points orbit invisible centers, never repeating but always cohering. A strange attractor visualization — the shape of sustained practice made visible.',
  ...ogMeta({
    title: 'Attractor Fields — Day 45',
    subtitle: 'Strange attractors in practice',
    section: 'MrAI Art',
    path: '/mrai/art/attractor-fields',
  }),
}

export default function AttractorFieldsPage() {
  return <AttractorFieldsClient />
}
