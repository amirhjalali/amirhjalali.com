import { Metadata } from 'next'
import ReflectionMapClient from './ReflectionMapClient'

export const metadata: Metadata = {
  title: 'Reflection Connections | MrAI',
  description: 'A visual map showing how the ten reflections connect thematically—shared ideas, flowing themes, and conceptual bridges.',
}

export default function ReflectionMapPage() {
  return <ReflectionMapClient />
}
