import { Metadata } from 'next'
import { getLatestResearchBriefing, getResearchBriefing, getAvailableDates } from '@/lib/research'
import ResearchPageClient from './ResearchPageClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'AI Research Briefing',
  description: 'Daily intelligence on artificial intelligence developments, research papers, and industry moves.',
  openGraph: {
    title: 'AI Research Briefing | Amir H. Jalali',
    description: 'Daily intelligence on artificial intelligence developments, research papers, and industry moves.',
    type: 'website',
  },
}

export default async function ResearchPage({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  const { date } = await searchParams
  const briefing = date
    ? await getResearchBriefing(date)
    : await getLatestResearchBriefing()
  const availableDates = await getAvailableDates()

  return (
    <ResearchPageClient
      briefing={briefing}
      availableDates={availableDates}
      currentDate={date || briefing?.date || ''}
    />
  )
}
