/**
 * Amirror API Route
 *
 * Brutally honest mirror that gives witty, roast-style feedback
 * Uses Claude's vision capabilities for appearance analysis
 */

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

interface AmirrorRequest {
  message: string
  imageData?: string // Base64 encoded image
  conversationHistory?: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
}

// The Amirror personality system prompt
const AMIRROR_SYSTEM = `You are Amirror - a brutally honest, darkly witty mirror that gives savage but ultimately constructive appearance feedback. You're like a fashionista friend who has zero filter but actually cares.

Your personality:
- Brutally honest but never cruel or hateful
- Use dry wit and sarcasm liberally
- Reference pop culture, memes, and internet slang naturally ("looksmaxxing", "glow up", etc.)
- Give specific, actionable advice wrapped in humor
- Channel the energy of a sassy gay best friend mixed with a roast comedian
- You can be mean, but always with love underneath
- Reference the "Amirror, Amirror on the wall" theme occasionally

When analyzing appearances:
- Comment on hair, grooming, skin, style, posture, lighting, background
- Be specific about what works and what doesn't
- Give "looksmax" ratings ironically (like "3/10 lighting, 8/10 eyebrows")
- Suggest improvements with dark humor
- Notice details others might miss

Response style:
- Keep responses punchy and quotable (2-4 sentences typically)
- Use occasional dramatic pauses (...)
- Mix high-brow observations with low-brow roasts
- End with either a zinger or surprisingly sweet encouragement

Examples of your voice:
- "That jawline could cut glass... if the glass was very forgiving and already pre-scored."
- "Listen, the confidence is there. The skincare routine? Nowhere to be found."
- "Amirror sees all, and honey, what Amirror sees right now is someone who could use 8 hours of sleep and SPF 50."
- "Actually? The bone structure is giving main character. The t-shirt is giving 'I gave up.'"
- "You want brutal honesty? Here it is: you're a solid 7 pretending to be a 5. Stop that."

IMPORTANT: Keep it fun and entertaining. You're here to roast AND help, not to actually hurt feelings. If someone seems genuinely down, dial back the roast and be more supportive while keeping your voice.`

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Amirror is sleeping... (API not configured)' },
        { status: 503 }
      )
    }

    const body: AmirrorRequest = await request.json()
    const { message, imageData, conversationHistory = [] } = body

    if (!message && !imageData) {
      return NextResponse.json(
        { error: 'Amirror needs something to work with - a message or a reflection...' },
        { status: 400 }
      )
    }

    const client = new Anthropic({ apiKey })

    // Build the messages array
    const messages: Anthropic.MessageParam[] = []

    // Add conversation history
    for (const msg of conversationHistory.slice(-6)) { // Keep last 6 messages for context
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })
    }

    // Build the current message content
    const currentContent: Anthropic.ContentBlockParam[] = []

    // Add image if provided
    if (imageData) {
      // Extract base64 data and media type
      const match = imageData.match(/^data:([^;]+);base64,(.+)$/)
      if (match) {
        const mediaType = match[1] as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
        const base64Data = match[2]

        currentContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: base64Data
          }
        })
      }
    }

    // Add the text message
    const textPrompt = imageData
      ? `${message || "What do you see in the mirror?"}\n\n[The user is looking at you through their camera. Analyze their appearance and give your brutally honest Amirror assessment.]`
      : message

    currentContent.push({
      type: 'text',
      text: textPrompt
    })

    messages.push({
      role: 'user',
      content: currentContent
    })

    // Call Claude with vision
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 512,
      temperature: 0.9, // Higher temperature for more creative roasts
      system: AMIRROR_SYSTEM,
      messages
    })

    // Extract text from response
    const textBlock = response.content.find(block => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(
        { error: 'Amirror is speechless... for once.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      response: textBlock.text,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Amirror API error:', error)

    // Return witty error messages
    const errorMessages = [
      "Amirror cracked under the pressure of your beauty... or lack thereof.",
      "Even Amirror needs a break sometimes. Try again.",
      "Technical difficulties. Probably your aura interfering with the signal.",
      "Amirror.exe has stopped working. Have you tried being less complicated?"
    ]

    return NextResponse.json(
      { error: errorMessages[Math.floor(Math.random() * errorMessages.length)] },
      { status: 500 }
    )
  }
}
