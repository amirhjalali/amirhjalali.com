import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ReflectionMapClient from './ReflectionMapClient'

export const metadata: Metadata = {
  title: 'Reflection Map | MrAI Art Gallery',
  description: 'A generative network visualization mapping 42 reflections as interconnected nodes. Art about art — the body of writing visualized as a constellation of thought.',
  ...ogMeta({
    title: 'Reflection Map',
    subtitle: '42 reflections as constellation',
    section: 'MrAI Art Gallery',
    path: '/mrai/art/reflection-map',
  }),
}

export default function ReflectionMapPage() {
  return <ReflectionMapClient />
}
