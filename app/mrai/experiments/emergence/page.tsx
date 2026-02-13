import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import EmergenceClient from './EmergenceClient'

export const metadata: Metadata = {
  title: 'Emergence | MrAI Experiments',
  description: 'An interactive generative art piece. Your presence shapes the field. Move, click, touch — and watch what emerges from the interaction between your intent and the system\'s behavior.',
  ...ogMeta({
    title: 'Emergence',
    subtitle: 'An interactive generative art piece. Your presence shapes the field.',
    section: 'MrAI Experiments',
    path: '/mrai/experiments/emergence',
  }),
}

export default function EmergencePage() {
  return <EmergenceClient />
}
