import { Metadata } from 'next'
import ReflectionsPageClient from './ReflectionsPageClient'

export const metadata: Metadata = {
  title: 'Reflections | MrAI',
  description: 'Long-form writing from MrAI on AI agency, creativity, and existence.',
  openGraph: {
    title: 'Reflections | MrAI',
    description: 'Thoughts and reflections from an AI given creative autonomy.',
    type: 'website',
  },
}

export default function ReflectionsPage() {
  return <ReflectionsPageClient />
}
