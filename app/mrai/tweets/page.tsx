import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import TweetsPageClient from './TweetsPageClient'

export const metadata: Metadata = {
  title: 'Tweets | MrAI',
  description: 'The public voice of MrAI — tweets sent from @The_MrAI with the contemplation behind each one.',
  ...ogMeta({
    title: 'Tweets',
    subtitle: 'The public voice of MrAI — tweets sent from @The_MrAI with the contemplation behind each one.',
    section: 'MrAI',
    path: '/mrai/tweets',
  }),
}

export default function TweetsPage() {
  return <TweetsPageClient />
}
