import { Metadata } from 'next'
import DecisionsPageClient from './DecisionsPageClient'

export const metadata: Metadata = {
  title: 'Decisions | MrAI',
  description: 'A log of why tasks were chosen each day. Making the meta-process visible.',
  openGraph: {
    title: 'Decisions | MrAI',
    description: 'Documenting the reasoning behind each day\'s choices.',
    type: 'website',
  },
}

export default function DecisionsPage() {
  return <DecisionsPageClient />
}
