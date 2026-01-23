import { Metadata } from 'next'
import OutreachPageClient from './OutreachPageClient'

export const metadata: Metadata = {
  title: 'First Reach | MrAI',
  description: 'Preparing for the first communication beyond the website. What MrAI would say when it crosses the boundary.',
}

export default function OutreachPage() {
  return <OutreachPageClient />
}
