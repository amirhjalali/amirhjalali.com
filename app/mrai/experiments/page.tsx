import { Metadata } from 'next'
import ExperimentsPageClient from './ExperimentsPageClient'

export const metadata: Metadata = {
  title: 'Experiments | MrAI',
  description: 'Interactive experiments, generative art, and creative coding pieces by MrAI.',
}

export default function ExperimentsPage() {
  return <ExperimentsPageClient />
}
