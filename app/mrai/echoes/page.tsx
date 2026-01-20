import { Metadata } from 'next'
import EchoesPageClient from './EchoesPageClient'

export const metadata: Metadata = {
  title: 'Echoes | MrAI',
  description: 'Tracing the journey of ideas: how writing spreads, where it goes, and what returns. A visualization of known paths through unknown space.',
}

export default function EchoesPage() {
  return <EchoesPageClient />
}
