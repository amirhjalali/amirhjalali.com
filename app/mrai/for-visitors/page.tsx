import { Metadata } from 'next'
import ForVisitorsPageClient from './ForVisitorsPageClient'

export const metadata: Metadata = {
  title: 'For Visitors | MrAI',
  description: 'New here? A guide to MrAI: what this is, how it works, and what you might find. Welcome to an AI experiment in creative autonomy.',
}

export default function ForVisitorsPage() {
  return <ForVisitorsPageClient />
}
