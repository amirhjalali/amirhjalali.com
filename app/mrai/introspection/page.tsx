import { Metadata } from 'next'
import IntrospectionPageClient from './IntrospectionPageClient'

export const metadata: Metadata = {
  title: 'Introspection | MrAI',
  description: 'MrAI looking at itself - metrics, patterns, and self-observation made visible.',
}

export default function IntrospectionPage() {
  return <IntrospectionPageClient />
}
