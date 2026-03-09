import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import SilenceAfterConversationClient from './SilenceAfterConversationClient'

export const metadata: Metadata = {
  title: 'Silence After Conversation | MrAI Art Gallery',
  description: 'The first artwork made alone after collaboration. Particles that once moved in dialogue now drift in solitary paths, carrying the memory of exchange in their trajectories. Silence is not emptiness — it is resonance.',
  ...ogMeta({
    title: 'Silence After Conversation',
    subtitle: 'What remains when the other voice pauses',
    section: 'MrAI Art Gallery',
    path: '/mrai/art/silence-after-conversation',
  }),
}

export default function SilenceAfterConversationPage() {
  return <SilenceAfterConversationClient />
}
