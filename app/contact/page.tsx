import { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Amir H. Jalali. Available for collaboration, consulting, and speaking opportunities.',
  openGraph: {
    title: 'Contact | Amir H. Jalali',
    description: 'Get in touch with Amir H. Jalali. Available for collaboration, consulting, and speaking opportunities.',
    type: 'website',
    images: [{ url: 'https://amirhjalali.com/og-image.webp', width: 1200, height: 630, alt: 'Contact - Amir H. Jalali' }],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['https://amirhjalali.com/og-image.webp'],
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}
