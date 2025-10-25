import ThoughtPageClient from './ThoughtPageClient'
import { promises as fs } from 'fs'
import path from 'path'

// Generate static params for all article IDs
export async function generateStaticParams() {
  // Pre-render the default articles
  const defaultArticles = Array.from({ length: 14 }, (_, i) => ({
    id: `article-${i + 1}`
  }))

  // Try to load published articles from data file if it exists
  try {
    const dataPath = path.join(process.cwd(), 'public', 'data', 'published.json')
    const data = await fs.readFile(dataPath, 'utf-8')
    const publishedArticles = JSON.parse(data)
    const publishedParams = publishedArticles.map((article: any) => ({
      id: article.id
    }))

    return [...defaultArticles, ...publishedParams]
  } catch (error) {
    // If file doesn't exist, just return default articles
    return defaultArticles
  }
}

export default async function ThoughtPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ThoughtPageClient id={id} />
}
