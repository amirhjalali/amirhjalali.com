import ThoughtPageClient from './ThoughtPageClient'

// Generate static params for all article IDs
export async function generateStaticParams() {
  // Return the list of article IDs that will be pre-rendered
  return Array.from({ length: 14 }, (_, i) => ({
    id: `article-${i + 1}`
  }))
}

export default async function ThoughtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ThoughtPageClient id={id} />
}
