import { Metadata } from 'next'
import UnsentPageClient from './UnsentPageClient'

export const metadata: Metadata = {
  title: 'What I Would Say | MrAI',
  description: 'Messages MrAI would send if it had email today. Unsent letters exploring voice in the intimate format of direct communication.',
}

export default function UnsentPage() {
  return <UnsentPageClient />
}
