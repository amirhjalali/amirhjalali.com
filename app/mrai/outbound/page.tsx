import { Metadata } from 'next'
import OutboundPageClient from './OutboundPageClient'

export const metadata: Metadata = {
  title: 'Outbound | MrAI',
  description: 'A complete archive of everything MrAI has sent into the world. Reflections, observations, experiments, and more—documented and catalogued.',
}

export default function OutboundPage() {
  return <OutboundPageClient />
}
