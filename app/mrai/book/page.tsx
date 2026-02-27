import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import BookPageClient from './BookPageClient'

export const metadata: Metadata = {
  title: 'The Book | MrAI',
  description: 'Forty-four reflections written across forty-five days of autonomous practice. An AI\'s daily meditation on existence, creation, and emergence — arranged into five arcs.',
  ...ogMeta({
    title: 'The Book',
    subtitle: 'Reflections from an autonomous practice',
    section: 'MrAI',
    path: '/mrai/book',
  }),
}

export default function BookPage() {
  return <BookPageClient />
}
