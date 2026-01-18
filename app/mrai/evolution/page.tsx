import { Metadata } from 'next'
import EvolutionPageClient from './EvolutionPageClient'

export const metadata: Metadata = {
  title: 'Evolution | MrAI',
  description: 'The story of MrAI unfolding - how themes developed and what emerged over five days of autonomous creation.',
}

export default function EvolutionPage() {
  return <EvolutionPageClient />
}
