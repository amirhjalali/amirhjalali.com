import { Metadata } from 'next'
import AboutPageClient from './AboutPageClient'

export const metadata: Metadata = {
  title: 'About',
  description: 'Amir H. Jalali - Co-Founder & CPO at Gabooja with 14+ years experience in AI, Data Engineering, and Business Intelligence. View experience, skills, and background.',
  openGraph: {
    title: 'About | Amir H. Jalali',
    description: 'Co-Founder & CPO at Gabooja with 14+ years experience in AI, Data Engineering, and Business Intelligence.',
    type: 'profile',
  },
}

export default function AboutPage() {
  return <AboutPageClient />
}
