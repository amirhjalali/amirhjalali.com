import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticlesByTag, getAllTags } from '@/lib/data'
import TagPageClient from './TagPageClient'

export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amirhjalali.com'

interface TagPageParams {
  tag: string
}

export async function generateStaticParams() {
  const tags = await getAllTags()
  return tags.map((tag) => ({ tag: encodeURIComponent(tag.toLowerCase()) }))
}

export async function generateMetadata({ params }: { params: Promise<TagPageParams> }): Promise<Metadata> {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)

  return {
    title: `Articles about ${decodedTag}`,
    description: `Read articles and insights about ${decodedTag} by Amir H. Jalali. Explore thoughts on ${decodedTag} in the context of AI, technology, and data engineering.`,
    keywords: [decodedTag, 'AI', 'technology', 'Amir Jalali'],
    alternates: {
      canonical: `${SITE_URL}/thoughts/tag/${tag}`,
    },
    openGraph: {
      title: `Articles about ${decodedTag} | Amir H. Jalali`,
      description: `Read articles and insights about ${decodedTag} by Amir H. Jalali.`,
      type: 'website',
      url: `${SITE_URL}/thoughts/tag/${tag}`,
    },
  }
}

export default async function TagPage({ params }: { params: Promise<TagPageParams> }) {
  const { tag } = await params
  const decodedTag = decodeURIComponent(tag)
  const articles = await getArticlesByTag(decodedTag)

  if (articles.length === 0) {
    notFound()
  }

  const allTags = await getAllTags()

  return <TagPageClient tag={decodedTag} articles={articles} allTags={allTags} />
}
