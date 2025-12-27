import { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with Amir H. Jalali. Available for collaboration, consulting, and speaking opportunities.',
  openGraph: {
    title: 'Contact | Amir H. Jalali',
    description: 'Get in touch with Amir H. Jalali. Available for collaboration, consulting, and speaking opportunities.',
    type: 'website',
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}
