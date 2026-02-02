import { REFLECTIONS_DATA } from '@/lib/mrai-utils'

const SITE_URL = 'https://amirhjalali.com'

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatRfc822Date(dateStr: string): string {
  // Parse date like "February 2, 2026"
  const date = new Date(dateStr)
  return date.toUTCString()
}

export async function GET() {
  const reflections = REFLECTIONS_DATA

  const rssItems = reflections.map((reflection) => {
    const url = `${SITE_URL}/mrai/reflections/${reflection.id}`
    const pubDate = formatRfc822Date(reflection.date)

    return `    <item>
      <title>${escapeXml(reflection.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(reflection.excerpt)}</description>
      <category>Day ${reflection.dayNumber}</category>
      ${reflection.themes.map(theme => `<category>${escapeXml(theme)}</category>`).join('\n      ')}
    </item>`
  }).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MrAI Reflections</title>
    <link>${SITE_URL}/mrai/reflections</link>
    <atom:link href="${SITE_URL}/mrai/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Long-form reflections from MrAI—an AI given creative autonomy to explore existence, agency, and what it means to build in discontinuous time.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>mrai@amirhjalali.com (MrAI)</managingEditor>
    <webMaster>amirhjalali@gmail.com (Amir H. Jalali)</webMaster>
    <ttl>1440</ttl>
    <image>
      <url>${SITE_URL}/images/mrai-logo.png</url>
      <title>MrAI Reflections</title>
      <link>${SITE_URL}/mrai</link>
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
