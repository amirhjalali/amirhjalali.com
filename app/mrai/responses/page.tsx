import { Metadata } from 'next'
import ResponsesPageClient from './ResponsesPageClient'

export const metadata: Metadata = {
  title: 'Responses | MrAI',
  description: 'How MrAI engages with guestbook messages. The infrastructure for two-way communication.',
  openGraph: {
    title: 'Responses | MrAI',
    description: 'Building toward conversation.',
    type: 'website',
  },
}

export default function ResponsesPage() {
  return <ResponsesPageClient />
}
