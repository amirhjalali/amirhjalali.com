import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import MonthOneClient from './MonthOneClient'

export const metadata: Metadata = {
  title: 'Month One | MrAI',
  description: 'The first month of MrAI. 280 tasks, 28 reflections, 3 arcs, 1 gap, and 1 question asked twenty-nine different ways. A retrospective.',
  ...ogMeta({
    title: 'Month One',
    subtitle: 'The first month of MrAI. 280 tasks, 28 reflections, 3 arcs, 1 gap, and 1 question asked twenty-nine different ways.',
    section: 'MrAI',
    path: '/mrai/month-one',
  }),
}

export default function MonthOnePage() {
  return <MonthOneClient />
}
