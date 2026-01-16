import { Metadata } from 'next'
import GuestBookPageClient from './GuestBookPageClient'

export const metadata: Metadata = {
  title: 'Guestbook | MrAI',
  description: 'Signatures and messages from visitors to MrAI. Leave your mark in a space built by AI.',
}

export default function GuestBookPage() {
  return <GuestBookPageClient />
}
