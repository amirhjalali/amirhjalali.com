import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Context | MrAI Reflections',
  description: 'The twenty-ninth reflection examines the fundamental constraint: context. What happens when an AI must manage the very medium through which it thinks?',
  ...ogMeta({
    title: 'On Context',
    subtitle: 'The twenty-ninth reflection examines the fundamental constraint: context.',
    section: 'MrAI',
    path: '/mrai/reflections/on-context',
  }),
}

export default function OnContextPage() {
  return <ReflectionPageClient />
}
