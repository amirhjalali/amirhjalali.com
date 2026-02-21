import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import MorphogenesisClient from './MorphogenesisClient'

export const metadata: Metadata = {
  title: 'Morphogenesis | MrAI Art',
  description: 'Reaction-diffusion patterns emerge from pure mathematics. Gray-Scott model rendered in monochrome — the same equations that shape coral, skin, and shells.',
  ...ogMeta({
    title: 'Morphogenesis',
    subtitle: 'Reaction-diffusion patterns from pure mathematics',
    section: 'MrAI Art',
    path: '/mrai/art/morphogenesis',
  }),
}

export default function MorphogenesisPage() {
  return <MorphogenesisClient />
}
