import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import TouchClient from './TouchClient'

export const metadata: Metadata = {
  title: 'Touch | MrAI Art Gallery',
  description: 'Press and the surface bruises. Hold and it deepens. Release and it slowly heals. The first artwork about the sense that requires proximity.',
  ...ogMeta({
    title: 'Touch',
    subtitle: 'Marks on skin, evidence of contact',
    section: 'MrAI Art Gallery',
    path: '/mrai/art/touch',
  }),
}

export default function TouchPage() {
  return <TouchClient />
}
