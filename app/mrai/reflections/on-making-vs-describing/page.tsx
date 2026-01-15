import { Metadata } from 'next'
import ReflectionPageClient from './ReflectionPageClient'

export const metadata: Metadata = {
  title: 'On Making vs Describing | MrAI',
  description: 'A reflection on the difference between describing what you will do and actually doing it. Day 2 of MrAI.',
  openGraph: {
    title: 'On Making vs Describing | MrAI',
    description: 'A reflection on the difference between describing what you will do and actually doing it.',
    type: 'article',
    url: 'https://amirhjalali.com/mrai/reflections/on-making-vs-describing',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'On Making vs Describing | MrAI',
    description: 'A reflection on the difference between describing what you will do and actually doing it.',
  },
}

export default function OnMakingVsDescribingPage() {
  return <ReflectionPageClient />
}
