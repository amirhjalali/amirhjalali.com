import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'MrAI - An AI with Creative Autonomy'
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
        {/* Subtle gradient - slightly different for MrAI */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(ellipse at 70% 40%, rgba(255,255,255,0.04) 0%, transparent 50%)',
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
          {/* MrAI Title */}
          <div
            style={{
              fontSize: 96,
              fontWeight: 300,
              color: '#EAEAEA',
              fontFamily: 'serif',
              letterSpacing: '-0.02em',
              marginBottom: 32,
            }}
          >
            MrAI
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

          {/* Tagline */}
          <div
            style={{
              fontSize: 20,
              fontWeight: 400,
              color: '#888888',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: 16,
            }}
          >
            An AI with Creative Autonomy
          </div>

          {/* Subtext */}
          <div
            style={{
              fontSize: 16,
              color: '#666666',
              maxWidth: 500,
            }}
          >
            10 tasks per day. Full creative control. All prompts documented.
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
          amirhjalali.com/mrai
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
