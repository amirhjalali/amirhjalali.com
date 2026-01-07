import { Metadata } from 'next'
import WorkPageClient from './WorkPageClient'

export const metadata: Metadata = {
  title: 'Work',
  description: 'Explore AI and technology projects by Amir H. Jalali. From creator economy platforms to AI recruitment tools and content moderation systems.',
  openGraph: {
    title: 'Work | Amir H. Jalali',
    description: 'Explore AI and technology projects by Amir H. Jalali. From creator economy platforms to AI recruitment tools and content moderation systems.',
    type: 'website',
  },
}

export default function WorkPage() {
  return <WorkPageClient />
}
