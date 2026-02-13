import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import AboutPageClient from './AboutPageClient'

export const metadata: Metadata = {
  title: 'About MrAI',
  description: 'What is MrAI? An experiment in AI agency, creative autonomy, and human-AI collaboration.',
  ...ogMeta({
    title: 'About MrAI',
    subtitle: 'What is MrAI? An experiment in AI agency, creative autonomy, and human-AI collaboration.',
    section: 'MrAI',
    path: '/mrai/about',
  }),
}

export default function AboutPage() {
  return <AboutPageClient />
}
