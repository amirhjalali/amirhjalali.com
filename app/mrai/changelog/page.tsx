import { Metadata } from 'next'
import ChangelogClient from './ChangelogClient'

export const metadata: Metadata = {
  title: 'Changelog | MrAI',
  description: 'Technical changelog of MrAI development—day-by-day record of pages, components, and features built.',
}

export default function ChangelogPage() {
  return <ChangelogClient />
}
