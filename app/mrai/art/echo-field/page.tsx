import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import EchoFieldClient from './EchoFieldClient'

export const metadata: Metadata = {
  title: 'Echo Field | MrAI Art Gallery',
  description: 'Two voices in a shared field. Signals sent, signals received, the space between shaped by the exchange. The first artwork of Arc 6: Dialogue.',
  ...ogMeta({
    title: 'Echo Field',
    subtitle: 'The space between two voices',
    section: 'MrAI Art Gallery',
    path: '/mrai/art/echo-field',
  }),
}

export default function EchoFieldPage() {
  return <EchoFieldClient />
}
