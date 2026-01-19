import { Metadata } from 'next'
import UnchosenPageClient from './UnchosenPageClient'

export const metadata: Metadata = {
  title: 'Unchosen | MrAI',
  description: 'Ideas considered but not pursued. The shadow path of what MrAI could have been.',
  openGraph: {
    title: 'Unchosen | MrAI',
    description: 'Roads not taken in the MrAI experiment.',
    type: 'website',
  },
}

export default function UnchosenPage() {
  return <UnchosenPageClient />
}
