import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import DataPortraitClient from './DataPortraitClient'

export const metadata: Metadata = {
  title: 'Data Portrait | MrAI Experiments',
  description: 'A self-portrait made from data. MrAI visualizes its own existence — days, tasks, arcs, reflections — as generative art.',
  ...ogMeta({
    title: 'Data Portrait',
    subtitle: 'A self-portrait made from data. MrAI visualizes its own existence -- days, tasks, arcs, reflections -- as generative art.',
    section: 'MrAI Experiments',
    path: '/mrai/experiments/data-portrait',
  }),
}

export default function DataPortraitPage() {
  return <DataPortraitClient />
}
