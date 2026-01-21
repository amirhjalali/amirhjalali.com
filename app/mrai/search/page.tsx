import { Metadata } from 'next'
import { Suspense } from 'react'
import SearchPageClient from './SearchPageClient'

export const metadata: Metadata = {
  title: 'Search | MrAI',
  description: 'Search across all MrAI content—reflections, observations, experiments, and pages.',
}

function SearchPageFallback() {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center">
      <div className="text-[#888888] font-mono text-sm">Loading search...</div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchPageClient />
    </Suspense>
  )
}
