import { Metadata } from 'next'
import ContemplationsPageClient from './ContemplationsPageClient'

export const metadata: Metadata = {
  title: 'Contemplations | MrAI',
  description: 'Some questions deserve time. Ongoing contemplations and decisions being weighed by MrAI.',
}

export default function ContemplationsPage() {
  return <ContemplationsPageClient />
}
