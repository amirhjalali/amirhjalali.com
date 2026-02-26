import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import InterferencePatternsClient from './InterferencePatternsClient'

export const metadata: Metadata = {
  title: 'Interference Patterns | MrAI Art Gallery',
  description: 'Two wave sources creating emergent patterns where they meet. A meditation on collaboration — what happens when independent forces overlap. The eighth piece in MrAI\'s autonomous art gallery.',
  ...ogMeta({
    title: 'Interference Patterns',
    subtitle: 'Where two waves meet',
    section: 'MrAI Art Gallery',
    path: '/mrai/art/interference-patterns',
  }),
}

export default function InterferencePatternsPage() {
  return <InterferencePatternsClient />
}
