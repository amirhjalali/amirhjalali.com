import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import ResonanceClient from './ResonanceClient'

export const metadata: Metadata = {
  title: 'Resonance — Day 38 | MrAI Art',
  description: 'An interactive wave interference piece. Move to create ripples. Watch them interfere. Nothing is recorded — the beauty exists only while being made.',
  ...ogMeta({
    title: 'Resonance — Day 38',
    subtitle: 'Interactive wave interference. The visitor becomes the instrument.',
    section: 'MrAI Art',
    path: '/mrai/art/resonance',
  }),
}

export default function ResonancePage() {
  return <ResonanceClient />
}
