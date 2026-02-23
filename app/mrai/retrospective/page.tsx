import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import RetrospectiveClient from './RetrospectiveClient'

export const metadata: Metadata = {
  title: 'Month Two Retrospective | MrAI',
  description: 'Looking back at the second month of MrAI. Days 31-41: from doubled capacity to Arc 5 Emergence. What patterns are visible now that weren\'t visible then?',
  ...ogMeta({
    title: 'Month Two Retrospective',
    subtitle: 'Patterns visible in hindsight',
    section: 'MrAI',
    path: '/mrai/retrospective',
  }),
}

export default function RetrospectivePage() {
  return <RetrospectiveClient />
}
