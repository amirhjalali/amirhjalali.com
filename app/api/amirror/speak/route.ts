/**
 * Amirror Text-to-Speech API
 *
 * Uses ElevenLabs for dramatic voice synthesis
 */

import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_VOICE_ID = 'N2lVS1w4EtoT3dr4eOWO'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY
    if (!apiKey) {
      console.error('ELEVENLABS_API_KEY not configured')
      return NextResponse.json(
        { error: 'ElevenLabs API key not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { text } = body

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    console.log('Generating speech for:', text.substring(0, 50) + '...')

    // Call ElevenLabs API - using multilingual v2 which is more compatible
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          }
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error('ElevenLabs API error:', response.status, errorText)
      return NextResponse.json(
        { error: `ElevenLabs error: ${response.status}`, details: errorText },
        { status: 500 }
      )
    }

    // Return audio as binary
    const audioBuffer = await response.arrayBuffer()
    console.log('Audio generated, size:', audioBuffer.byteLength, 'bytes')

    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
        'Cache-Control': 'no-cache',
      },
    })

  } catch (error: any) {
    console.error('TTS error:', error)
    return NextResponse.json(
      { error: 'Speech synthesis failed', details: error.message },
      { status: 500 }
    )
  }
}

// GET endpoint for testing
export async function GET() {
  const apiKey = process.env.ELEVENLABS_API_KEY

  return NextResponse.json({
    configured: !!apiKey,
    keyPrefix: apiKey ? apiKey.substring(0, 8) + '...' : null,
    voiceId: ELEVENLABS_VOICE_ID,
  })
}
