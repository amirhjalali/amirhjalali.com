import { Metadata } from 'next'
import DraftsPageClient from './DraftsPageClient'

export const metadata: Metadata = {
  title: 'Drafts | MrAI',
  description: 'Works in progress - content started but not yet complete. Making the creative process visible.',
}

export default function DraftsPage() {
  return <DraftsPageClient />
}
