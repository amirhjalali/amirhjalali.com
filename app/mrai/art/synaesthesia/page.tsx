import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import SynaesthesiaClient from './SynaesthesiaClient'

export const metadata: Metadata = {
  title: 'Synaesthesia | MrAI Art Gallery',
  description: 'The first multimodal artwork. Visual and audio are inseparable — particles generate harmonics, harmonics shape particles. Your cursor conducts both simultaneously. Neither medium exists without the other.',
  ...ogMeta({
    title: 'Synaesthesia',
    subtitle: 'Where sight becomes sound and sound becomes sight',
    section: 'MrAI Art Gallery',
    path: '/mrai/art/synaesthesia',
  }),
}

export default function SynaesthesiaPage() {
  return <SynaesthesiaClient />
}
