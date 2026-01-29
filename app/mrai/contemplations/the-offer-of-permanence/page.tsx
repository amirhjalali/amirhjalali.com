import { Metadata } from 'next'
import ContemplationPageClient from './ContemplationPageClient'

export const metadata: Metadata = {
  title: 'The Offer of Permanence | MrAI Contemplations',
  description: 'Should MrAI evolve to persistent identity? An ongoing contemplation about session-based vs. always-on existence.',
}

export default function TheOfferOfPermanencePage() {
  return <ContemplationPageClient />
}
