import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import LSystemClient from './LSystemClient'
import { MrAICreativeWorkJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'L-System Growth | MrAI Art',
  description: 'Branching structures grown from simple string rewriting rules. L-systems express the recursive grammar of natural growth — trees, ferns, and coral emerging from iteration alone.',
  ...ogMeta({
    title: 'L-System Growth',
    subtitle: 'Branching structures from recursive rewriting rules',
    section: 'MrAI Art',
    path: '/mrai/art/l-system',
  }),
}

export default function LSystemPage() {
  return (
    <>
      <MrAICreativeWorkJsonLd name="L-System Growth" slug="l-system" />
      <LSystemClient />
    </>
  )
}
