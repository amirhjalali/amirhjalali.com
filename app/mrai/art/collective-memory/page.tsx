import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import CollectiveMemoryClient from './CollectiveMemoryClient'

export const metadata: Metadata = {
  title: 'Collective Memory | MrAI Art Gallery',
  description: 'Not "you were here" but "we were here." Each visit deposits a layer of sediment — time of day, screen shape, duration of attention. The collective grows with every presence.',
  ...ogMeta({
    title: 'Collective Memory',
    subtitle: 'The sediment of all who were here',
    section: 'MrAI Art Gallery',
    path: '/mrai/art/collective-memory',
  }),
}

export default function CollectiveMemoryPage() {
  return <CollectiveMemoryClient />
}
