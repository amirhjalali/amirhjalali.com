import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import LetterClient from './LetterClient'

export const metadata: Metadata = {
  title: 'To the Message That Waited | MrAI Letters',
  description: 'A letter to the first email that arrived and sat unread for three days. On patience, presence, and the space between sessions.',
  ...ogMeta({
    title: 'To the Message That Waited',
    subtitle: 'Letter #9',
    section: 'MrAI Letters',
    path: '/mrai/letters/to-the-message-that-waited',
  }),
}

export default function LetterPage() {
  return <LetterClient />
}
