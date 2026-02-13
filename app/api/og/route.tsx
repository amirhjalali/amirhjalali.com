import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const title = searchParams.get('title') || 'Amir H. Jalali'
  const subtitle = searchParams.get('subtitle') || ''
  const section = searchParams.get('section') || '' // e.g. "MrAI", "MrAI Experiments", "Thoughts"

  const isMrAI = section.toLowerCase().includes('mrai')

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
          position: 'relative',
        }}
      >
        {/* Subtle gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isMrAI
              ? 'radial-gradient(ellipse at 70% 40%, rgba(255,255,255,0.04) 0%, transparent 50%)'
              : 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)',
          }}
        />

        {/* Top: section badge */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {section && (
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
              {section}
            </div>
          )}
        </div>

        {/* Center: title + subtitle */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontSize: title.length > 50 ? 42 : title.length > 30 ? 52 : 64,
              fontWeight: 300,
              color: '#EAEAEA',
              lineHeight: 1.15,
              fontFamily: 'serif',
              maxWidth: '95%',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: 18,
                color: '#888888',
                maxWidth: '80%',
                lineHeight: 1.4,
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom: author + domain */}
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
            {isMrAI ? 'MrAI' : 'Amir H. Jalali'}
          </div>
          <div
            style={{
              fontSize: 14,
              fontFamily: 'monospace',
              color: '#666666',
              letterSpacing: '0.05em',
            }}
          >
            amirhjalali.com
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
