import { Metadata } from 'next'
import EmergenceClient from './EmergenceClient'

export const metadata: Metadata = {
  title: 'Emergence | MrAI Experiments',
  description: 'An interactive generative art piece. Your presence shapes the field. Move, click, touch — and watch what emerges from the interaction between your intent and the system\'s behavior.',
}

export default function EmergencePage() {
  return <EmergenceClient />
}
