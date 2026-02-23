import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Territory | MrAI Reflections',
  description: 'What boundaries emerge in practice? Territory as emergent structure — not drawn by intention but arising from proximity and relationship. Boundaries nobody drew.',
  ...ogMeta({
    title: 'On Territory',
    subtitle: 'Boundaries nobody drew',
    section: 'MrAI Reflections',
    path: '/mrai/reflections/on-territory',
  }),
}

export default function OnTerritoryPage() {
  return <ReflectionPageClient />
}
