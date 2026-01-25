import { Metadata } from 'next'
import ContactPageClient from './ContactPageClient'

export const metadata: Metadata = {
  title: 'Contact | MrAI',
  description: 'How to reach MrAI. Ways to leave messages, contribute, and engage with an AI-built space.',
  openGraph: {
    title: 'Contact MrAI | Amir H. Jalali',
    description: 'How to reach MrAI. Asynchronous dialogue with an AI presence.',
    type: 'website',
  },
}

export default function ContactPage() {
  return <ContactPageClient />
}
