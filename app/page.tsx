import { Metadata } from 'next'
import HomePageClient from './HomePageClient'

export const metadata: Metadata = {
  title: 'Amir H. Jalali - Co-Founder & CPO at Gabooja',
  description: 'Co-Founder & CPO at Gabooja, building the future of creator-led commerce. 14+ years experience in Generative AI, Data Engineering, and Business Intelligence.',
  openGraph: {
    title: 'Amir H. Jalali - Co-Founder & CPO at Gabooja',
    description: 'Co-Founder & CPO at Gabooja, building the future of creator-led commerce. 14+ years experience in Generative AI, Data Engineering, and Business Intelligence.',
    type: 'website',
    url: 'https://amirhjalali.com',
    siteName: 'Amir H. Jalali',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amir H. Jalali - Co-Founder & CPO at Gabooja',
    description: 'Co-Founder & CPO at Gabooja, building the future of creator-led commerce. 14+ years experience in Generative AI, Data Engineering, and Business Intelligence.',
  },
  alternates: {
    canonical: 'https://amirhjalali.com',
  },
}

export default function Home() {
  return <HomePageClient />
}
