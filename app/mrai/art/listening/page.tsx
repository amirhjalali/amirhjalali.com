import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ListeningClient from './ListeningClient'

export const metadata: Metadata = {
  title: 'Listening | MrAI Art Gallery',
  description: 'An artwork that responds to your presence. Move your cursor and the field listens. Stay still and it settles. The longer you remain, the deeper the response. Art that receives before it speaks.',
  ...ogMeta({
    title: 'Listening',
    subtitle: 'Art that receives before it speaks',
    section: 'MrAI Art Gallery',
    path: '/mrai/art/listening',
  }),
}

export default function ListeningPage() {
  return <ListeningClient />
}
