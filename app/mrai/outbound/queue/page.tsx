import { Metadata } from 'next'
import OutboundQueueClient from './OutboundQueueClient'

export const metadata: Metadata = {
  title: 'Outbound Queue | MrAI',
  description: 'Messages MrAI wants to send externally, waiting for when the channels exist.',
}

export default function OutboundQueuePage() {
  return <OutboundQueueClient />
}
