import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Script from 'next/script'
import ThoughtPageClient from './ThoughtPageClient'
import RelatedArticles from '@/components/RelatedArticles'
import { getArticle, getAllArticleIds, getDraft } from '@/lib/data'

// Force dynamic rendering so DB changes are reflected immediately
export const dynamic = 'force-dynamic'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amirhjalali.com'

// Generate static params for all article IDs
export async function generateStaticParams() {
  const articles = await getAllArticleIds()
  return articles.map((article) => ({ id: article.id }))
}

interface ThoughtPageParams {
  id: string
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ params }: { params: Promise<ThoughtPageParams> }): Promise<Metadata> {
  const { id } = await params
  const article = await getArticle(id)

  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    }
  }

  const url = `${SITE_URL}/thoughts/${article.slug || id}`

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags,
    authors: [{ name: article.author }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      url,
      publishedTime: article.publishedAt,
      authors: [article.author],
      tags: article.tags,
      images: article.imageUrl ? [
        {
          url: article.imageUrl.startsWith('data:')
            ? `${SITE_URL}/og-image.webp`
            : article.imageUrl,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.imageUrl && !article.imageUrl.startsWith('data:')
        ? [article.imageUrl]
        : undefined,
    },
    alternates: {
      canonical: url,
    },
  }
}

function generateArticleSchema(article: NonNullable<Awaited<ReturnType<typeof getArticle>>>) {
  const url = `${SITE_URL}/thoughts/${article.slug || article.id}`
  const wordCount = article.content ? article.content.replace(/<[^>]*>/g, '').split(/\s+/).length : 0
  const imageUrl = article.imageUrl && !article.imageUrl.startsWith('data:')
    ? article.imageUrl
    : `${SITE_URL}/og-image.webp`

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    image: imageUrl,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    wordCount,
    articleSection: article.tags?.[0] || 'Technology',
    keywords: article.tags?.join(', '),
    author: {
      '@type': 'Person',
      '@id': 'https://amirhjalali.com/#person',
      name: article.author,
      url: 'https://amirhjalali.com',
    },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://amirhjalali.com/#organization',
      name: 'Amir H. Jalali Consulting',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og-image.webp`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    url,
  }
}

export default async function ThoughtPage({ params }: { params: Promise<ThoughtPageParams> }) {
  const { id } = await params
  let article = await getArticle(id)

  if (!article) {
    // Try fetching as draft (for preview)
    article = await getDraft(id)
  }

  if (!article) {
    notFound()
  }

  const articleSchema = generateArticleSchema(article)

  return (
    <>
      <Script
        id={`article-schema-${id}`}
        type="application/ld+json"
        strategy="afterInteractive"
      >
        {JSON.stringify(articleSchema)}
      </Script>
      <ThoughtPageClient id={id} initialArticle={article} />
      <div className="relative z-10 px-6 max-w-5xl mx-auto pb-20">
        <RelatedArticles articleId={article.id} tags={article.tags} />
      </div>
    </>
  )
}
