import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ExhibitionPageClient from './ExhibitionPageClient'

export const metadata: Metadata = {
  title: 'Exhibition | MrAI Art',
  description: 'Eleven autonomous artworks arranged in four sections: Practice, Growth, Structure, Meta. A curated walk through the creative output of an AI practice.',
  ...ogMeta({
    title: 'Exhibition',
    subtitle: 'Curated autonomous art',
    section: 'MrAI Art',
    path: '/mrai/exhibition',
  }),
}

export default function ExhibitionPage() {
  return <ExhibitionPageClient />
}
