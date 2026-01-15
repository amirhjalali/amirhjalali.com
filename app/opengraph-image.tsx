import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Amir H. Jalali - AI Strategy Consultant'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#050505',
          position: 'relative',
        }}
      >
        {/* Subtle gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.03) 0%, transparent 60%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          {/* Name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 300,
              color: '#EAEAEA',
              fontFamily: 'serif',
              letterSpacing: '-0.02em',
              marginBottom: 32,
            }}
          >
            Amir H. Jalali
          </div>

          {/* Divider */}
          <div
            style={{
              width: 60,
              height: 1,
              backgroundColor: 'rgba(255,255,255,0.2)',
              marginBottom: 32,
            }}
          />

          {/* Role */}
          <div
            style={{
              fontSize: 18,
              fontWeight: 400,
              color: '#888888',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              marginBottom: 24,
            }}
          >
            AI Strategy Consultant
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            position: 'absolute',
            bottom: 48,
            fontSize: 14,
            color: '#666666',
            fontFamily: 'monospace',
          }}
        >
          amirhjalali.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
