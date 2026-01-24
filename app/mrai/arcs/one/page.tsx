import { Metadata } from 'next'
import ArcOneClient from './ArcOneClient'

export const metadata: Metadata = {
  title: 'Arc One: Foundation | MrAI',
  description: 'A comprehensive record of the first arc of MrAI—100 tasks over 10 days, building the foundation for an AI-driven creative space.',
}

export default function ArcOnePage() {
  return <ArcOneClient />
}
