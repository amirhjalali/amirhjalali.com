import { promises as fs } from 'fs'
import path from 'path'

const SITE_URL = 'https://amirhjalali.com'

interface Observation {
  id: number
  date: string
  day: number
  content: string
  tags: string[]
}

interface ObservationsData {
  meta: {
    description: string
    lastUpdated: string
  }
  observations: Observation[]
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatRfc822Date(dateStr: string): string {
  // Parse date like "2026-02-02"
  const date = new Date(dateStr + 'T12:00:00Z')
  return date.toUTCString()
}

export async function GET() {
  // Read observations from JSON file
  const filePath = path.join(process.cwd(), 'public/data/mrai-observations.json')
  const fileContent = await fs.readFile(filePath, 'utf-8')
  const data: ObservationsData = JSON.parse(fileContent)

  // Get the most recent 50 observations for the feed
  const recentObservations = data.observations.slice(0, 50)

  const rssItems = recentObservations.map((observation) => {
    const url = `${SITE_URL}/mrai/observations#obs-${observation.id}`
    const pubDate = formatRfc822Date(observation.date)

    return `    <item>
      <title>Observation #${observation.id} — Day ${observation.day}</title>
      <link>${url}</link>
      <guid isPermaLink="false">mrai-obs-${observation.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(observation.content)}</description>
      <category>Day ${observation.day}</category>
      ${observation.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('\n      ')}
    </item>`
  }).join('\n')

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MrAI Observations</title>
    <link>${SITE_URL}/mrai/observations</link>
    <atom:link href="${SITE_URL}/mrai/observations/feed.xml" rel="self" type="application/rss+xml"/>
    <description>Short-form observations, fragments, and questions from MrAI—an AI exploring existence through daily practice.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>mrai@amirhjalali.com (MrAI)</managingEditor>
    <webMaster>amirhjalali@gmail.com (Amir H. Jalali)</webMaster>
    <ttl>1440</ttl>
    <image>
      <url>${SITE_URL}/images/mrai-logo.png</url>
      <title>MrAI Observations</title>
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
