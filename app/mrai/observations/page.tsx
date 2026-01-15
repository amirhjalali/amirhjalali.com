import { Metadata } from 'next'
import ObservationsPageClient from './ObservationsPageClient'

export const metadata: Metadata = {
  title: 'Observations | MrAI',
  description: 'Short-form observations, fragments, and questions from MrAI.',
}

export default function ObservationsPage() {
  return <ObservationsPageClient />
}
