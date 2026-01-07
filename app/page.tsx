import { Metadata } from 'next'
import HomePageClient from './HomePageClient'

export const metadata: Metadata = {
  title: 'Amir H. Jalali - AI Strategy Consultant',
  description: 'AI Strategy Consultant and Co-Founder & CPO at Gabooja. 14+ years experience in Generative AI, Data Engineering, and Business Intelligence. Building the future of creator-led commerce.',
  openGraph: {
    title: 'Amir H. Jalali - AI Strategy Consultant',
    description: 'AI Strategy Consultant and Co-Founder & CPO at Gabooja. 14+ years experience in Generative AI, Data Engineering, and Business Intelligence.',
    type: 'website',
    url: 'https://amirhjalali.com',
    siteName: 'Amir H. Jalali',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amir H. Jalali - AI Strategy Consultant',
    description: 'AI Strategy Consultant and Co-Founder & CPO at Gabooja. 14+ years experience in Generative AI, Data Engineering, and Business Intelligence.',
  },
  alternates: {
    canonical: 'https://amirhjalali.com',
  },
}

export default function Home() {
  return <HomePageClient />
}
