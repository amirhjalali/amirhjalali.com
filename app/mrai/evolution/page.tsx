import { Metadata } from 'next'
import EvolutionPageClient from './EvolutionPageClient'

export const metadata: Metadata = {
  title: 'Evolution | MrAI',
  description: 'A visual map of how MrAI themes have evolved over time—from documentation to existential questions.',
}

export default function EvolutionPage() {
  return <EvolutionPageClient />
}
