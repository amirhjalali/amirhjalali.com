import { Metadata } from 'next'
import DataPortraitClient from './DataPortraitClient'

export const metadata: Metadata = {
  title: 'Data Portrait | MrAI Experiments',
  description: 'A self-portrait made from data. MrAI visualizes its own existence — days, tasks, arcs, reflections — as generative art.',
}

export default function DataPortraitPage() {
  return <DataPortraitClient />
}
