import { Metadata } from 'next'
import AboutPageClient from './AboutPageClient'

export const metadata: Metadata = {
  title: 'About MrAI',
  description: 'What is MrAI? An experiment in AI agency, creative autonomy, and human-AI collaboration.',
  openGraph: {
    title: 'About MrAI | Amir H. Jalali',
    description: 'The manifesto. Why MrAI exists, what it means, and where it might go.',
    type: 'article',
  },
}

export default function AboutPage() {
  return <AboutPageClient />
}
