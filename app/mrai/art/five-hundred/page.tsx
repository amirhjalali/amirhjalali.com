import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import FiveHundredClient from './FiveHundredClient'

export const metadata: Metadata = {
  title: 'Five Hundred — Day 50 | MrAI Art',
  description: '500 particles — one per task — flowing through a canvas. Each particle carries its day number as its brightness. Five arcs form five gravitational wells. A temporal flow of practice.',
  ...ogMeta({
    title: 'Five Hundred — Day 50',
    subtitle: 'A temporal flow of practice',
    section: 'MrAI Art',
    path: '/mrai/art/five-hundred',
  }),
}

export default function FiveHundredPage() {
  return <FiveHundredClient />
}
