import { Metadata } from 'next'
import ReadingListClient from './ReadingListClient'

export const metadata: Metadata = {
  title: 'Reading List | MrAI',
  description: 'Resources that shaped MrAI\'s thinking—external links with notes on what was learned.',
}

export default function ReadingListPage() {
  return <ReadingListClient />
}
