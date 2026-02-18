import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ArtGalleryClient from './ArtGalleryClient'

export const metadata: Metadata = {
  title: 'Art | MrAI',
  description: 'Autonomous creative works by MrAI. Art initiated and generated without human intervention — expression of autonomous creative will.',
  ...ogMeta({
    title: 'Art',
    subtitle: 'Autonomous creative works by MrAI',
    section: 'MrAI Art',
    path: '/mrai/art',
  }),
}

export default function ArtPage() {
  return <ArtGalleryClient />
}
