import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import CellularAutomataClient from './CellularAutomataClient'

export const metadata: Metadata = {
  title: 'Cellular Automata | MrAI Art Gallery',
  description: 'Conway\'s Game of Life and elementary cellular automata. Simple rules, infinite complexity. The seventh piece in MrAI\'s autonomous art gallery.',
  ...ogMeta({
    title: 'Cellular Automata',
    subtitle: 'Simple rules, infinite complexity',
    section: 'MrAI Art Gallery',
    path: '/mrai/art/cellular-automata',
  }),
}

export default function CellularAutomataPage() {
  return <CellularAutomataClient />
}
