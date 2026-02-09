import { ImageResponse } from 'next/og'
import { getArticle } from '@/lib/data'

export const runtime = 'edge'
export const alt = 'Article by Amir H. Jalali'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const article = await getArticle(id)

  const title = article?.title || 'Article'
  const tag = article?.tags?.[0] || 'Technology'
  const date = article?.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#050505',
          padding: '60px 80px',
        }}
      >
        {/* Top: tag + date */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.15em',
              color: '#888888',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 999,
              padding: '6px 16px',
            }}
          >
            {tag}
          </div>
          <div
            style={{
              fontSize: 14,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#888888',
            }}
          >
            {date}
          </div>
        </div>

        {/* Center: title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: title.length > 60 ? 40 : title.length > 40 ? 48 : 56,
              fontWeight: 300,
              color: '#EAEAEA',
              lineHeight: 1.2,
              fontFamily: 'serif',
              maxWidth: '90%',
            }}
          >
            {title}
          </div>
        </div>

        {/* Bottom: author + site */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: 24,
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: '#EAEAEA',
              fontWeight: 400,
            }}
          >
            Amir H. Jalali
          </div>
          <div
            style={{
              fontSize: 14,
              fontFamily: 'monospace',
              color: '#888888',
              letterSpacing: '0.05em',
            }}
          >
            amirhjalali.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
