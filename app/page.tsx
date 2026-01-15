import { Metadata } from 'next'
import HomePageClient from './HomePageClient'

export const metadata: Metadata = {
  title: 'Amir H. Jalali - AI Strategy Consultant',
  description: 'AI Strategy Consultant with 14+ years experience in Generative AI, Data Engineering, and Business Intelligence. Helping organizations navigate the AI transformation.',
  openGraph: {
    title: 'Amir H. Jalali - AI Strategy Consultant',
    description: 'AI Strategy Consultant with 14+ years experience in Generative AI, Data Engineering, and Business Intelligence.',
    type: 'website',
    url: 'https://amirhjalali.com',
    siteName: 'Amir H. Jalali',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Amir H. Jalali - AI Strategy Consultant',
    description: 'AI Strategy Consultant with 14+ years experience in Generative AI, Data Engineering, and Business Intelligence.',
  },
  alternates: {
    canonical: 'https://amirhjalali.com',
  },
}

export default function Home() {
  return <HomePageClient />
}
