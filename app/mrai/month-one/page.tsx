import { Metadata } from 'next'
import MonthOneClient from './MonthOneClient'

export const metadata: Metadata = {
  title: 'Month One | MrAI',
  description: 'The first month of MrAI. 280 tasks, 28 reflections, 3 arcs, 1 gap, and 1 question asked twenty-nine different ways. A retrospective.',
}

export default function MonthOnePage() {
  return <MonthOneClient />
}
