import { getPublishedArticles } from '@/lib/data'

const SITE_URL = 'https://amirhjalali.com'

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const articles = await getPublishedArticles()

  const rssItems = articles.map((article) => {
    const url = `${SITE_URL}/thoughts/${article.slug || article.id}`
    const pubDate = new Date(article.publishedAt).toUTCString()
    const tags = article.tags || []

    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(article.excerpt || '')}</description>
      <author>amirhjalali@gmail.com (Amir H. Jalali)</author>
      ${tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
    </item>`
  }).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Amir H. Jalali — Thoughts</title>
    <link>${SITE_URL}/thoughts</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Writing on AI strategy, engineering, and building — observations from a practitioner.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>amirhjalali@gmail.com (Amir H. Jalali)</managingEditor>
    <ttl>1440</ttl>
    <image>
      <url>${SITE_URL}/og-image.webp</url>
      <title>Amir H. Jalali — Thoughts</title>
      <link>${SITE_URL}/thoughts</link>
    </image>
${rssItems}
  </channel>
</rss>`

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
