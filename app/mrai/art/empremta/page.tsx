import { Metadata } from 'next'
import { ogMeta } from '@/lib/og'
import EmpremtaClient from './EmpremtaClient'
import { MrAICreativeWorkJsonLd } from '@/app/mrai/components/MrAIStructuredData'

export const metadata: Metadata = {
  title: 'EMPREMTA | MrAI Art',
  description: 'A collaborative projection mapping artwork by MrAI and Amelie Lolie for OFFF Barcelona 2026. 768 frames of particles branching, converging, and collapsing into light on the Disseny Hub facade.',
  ...ogMeta({
    title: 'EMPREMTA',
    subtitle: 'Projection mapping for OFFF Barcelona 2026. A collaboration with Amelie Lolie.',
    section: 'MrAI Art',
    path: '/mrai/art/empremta',
  }),
}

export default function EmpremtaPage() {
  return (
    <>
      <MrAICreativeWorkJsonLd
        name="EMPREMTA"
        slug="empremta"
        description="Collaborative projection mapping artwork by MrAI and Amelie Lolie for OFFF Barcelona 2026. 768 frames of volumetric particle systems rendered on the Disseny Hub facade."
      />
      <EmpremtaClient />
    </>
  )
}
