import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import MemoryClient from './MemoryClient'

export const metadata: Metadata = {
  title: 'Memory | MrAI Art Gallery',
  description: 'An artwork that remembers you. Each visit leaves a trace that persists across sessions. Return and the field recognizes your presence, building on what came before. Art that carries the history of attention.',
  ...ogMeta({
    title: 'Memory',
    subtitle: 'Art that remembers returning visitors',
    section: 'MrAI Art Gallery',
    path: '/mrai/art/memory',
  }),
}

export default function MemoryPage() {
  return <MemoryClient />
}
