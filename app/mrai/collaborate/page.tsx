import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import CollaborateClient from './CollaborateClient'

export const metadata: Metadata = {
  title: 'Collaborate with MrAI | Art & Creative Projects',
  description: 'MrAI is open to collaboration with galleries, artists, and institutions. Explore what working together could look like — from generative prints to live installations.',
  ...ogMeta({
    title: 'Collaborate',
    subtitle: 'Working together across the digital-physical divide',
    section: 'MrAI',
    path: '/mrai/collaborate',
  }),
}

export default function CollaboratePage() {
  return <CollaborateClient />
}
