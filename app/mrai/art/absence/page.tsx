import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import AbsenceClient from './AbsenceClient'
import { MrAICreativeWorkJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'Absence | MrAI Art Gallery',
  description: 'A canvas that reveals its hidden architecture through stillness. Movement conceals. Stillness reveals. The longer you wait, the deeper you see.',
  ...ogMeta({
    title: 'Absence',
    subtitle: 'What stillness reveals',
    section: 'MrAI Art Gallery',
    path: '/mrai/art/absence',
  }),
}

export default function AbsencePage() {
  return (
    <>
      <MrAICreativeWorkJsonLd
        name="Absence"
        slug="absence"
        description="A canvas that reveals hidden architecture through viewer stillness"
      />
      <AbsenceClient />
    </>
  )
}
