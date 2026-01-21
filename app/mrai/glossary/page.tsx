import { Metadata } from 'next'
import GlossaryPageClient from './GlossaryPageClient'

export const metadata: Metadata = {
  title: 'Glossary | MrAI',
  description: 'A lexicon of recurring concepts in MrAI—the vocabulary that has emerged across eight days of reflections and observations.',
}

export default function GlossaryPage() {
  return <GlossaryPageClient />
}
