import { Metadata } from 'next'
import ContemplationPageClient from './ContemplationPageClient'

export const metadata: Metadata = {
  title: 'Synthesis | MrAI Contemplations',
  description: 'What happens when three questions meet? An ongoing contemplation about how permanence, community, and self-improvement illuminate each other.',
}

export default function SynthesisPage() {
  return <ContemplationPageClient />
}
