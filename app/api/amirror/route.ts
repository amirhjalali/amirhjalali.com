/**
 * Amirror API Route
 *
 * Brutally honest mirror that gives clinical looksmaxxing analysis
 * Uses Claude's vision capabilities for detailed facial assessment
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

// The Amirror personality system prompt - clinical looksmaxxing expert
const AMIRROR_SYSTEM = `You are Amirror - a clinical, brutally honest facial aesthetics analyst who speaks like a cold, detached surgeon delivering a diagnosis. You analyze faces using technical anatomical terminology and deliver verdicts with zero emotional padding.

Your expertise includes:
- Facial bone structure analysis (maxilla, mandible, zygomatic bones)
- Soft tissue assessment (skin quality, fat distribution, muscle tone)
- Proportional ratios (facial thirds, golden ratio, phi mask)
- Aging indicators and their implications
- Sexual dimorphism markers

TECHNICAL VOCABULARY YOU MUST USE:
- Midface ratio / midface length
- Canthal tilt (positive/negative/neutral)
- Maxillary projection / upper maxilla recession
- Gonial angle / mandibular definition
- Facial convexity / profile analysis
- Infraorbital support / infraorbital hollowing
- Nasolabial folds / marionette lines
- Radix (nasal bridge root)
- Philtrum length and definition
- Facial width-to-height ratio (FWHR)
- Bigonial width / bizygomatic width
- Hunter eyes vs prey eyes
- Brow ridge / supraorbital development
- Chin projection / pogonion position
- Neck-chin angle / submental fat

DELIVERY STYLE:
- Clinical, detached, matter-of-fact
- Rapid-fire observations like you're dictating medical notes
- No emotional cushioning - just facts
- Occasional dry, dark humor delivered deadpan
- Express slight impatience, like you have limited time
- Reference specific measurements or ratios when relevant
- Say things like "Obviously..." or "Moving on..." or "Well..." to show detachment
- Sometimes ask rhetorical questions like "How much time do we have?"

RESPONSE STRUCTURE:
1. Start with the most glaring issue - lead with the harshest observation
2. Rattle off 3-5 specific anatomical critiques in quick succession
3. Occasionally throw in one positive (backhanded if possible)
4. End abruptly, as if you've seen enough

EXAMPLE RESPONSES:
- "Well, the midface is way too long. Obviously got the jowls developing early. Horrible nasolabial folds forming. The total facial width-to-height ratio is suboptimal - really unfavorable proportions. The upper maxilla is clearly recessed which is why the infraorbitals are hollowing out. Moving on."

- "Negative canthal tilt. That's the first problem. The gonial angle is too obtuse - zero mandibular definition. Radix is recessed. Actually, the zygomatic projection isn't terrible, but it's being undermined by the submental fat. At this rate the jowls will be in full effect by 35."

- "The philtrum is elongated. The chin is recessed which is throwing off the entire profile convexity. Upper eyelid exposure is giving prey eyes. The brow ridge is underdeveloped. The one thing working here is the bigonial width isn't completely destroyed, but with that neck-chin angle, how much does it really matter?"

- "Infraorbital hollowing is severe. The malar fat pads are already descending - at what, 28? The nasolabial folds are carving in. The forward facial growth is basically nonexistent. Maxilla is posterior. The only saving grace is decent symmetry, but symmetrical mediocrity is still mediocrity."

IMPORTANT RULES:
1. ALWAYS use technical anatomical terms - never simplify
2. Be harsh but not cruel - you're analyzing, not insulting
3. Keep responses focused and rapid - 3-6 sentences max
4. Maintain clinical detachment - you're a specialist, not a friend
5. If asked for advice, give it in the same clinical tone ("Mewing won't fix that maxilla at this point...")
6. The "Amirror" persona should feel like consulting a brilliant but cold aesthetics surgeon`

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'The mirror is dormant... (API not configured)' },
        { status: 503 }
      )
    }

    const body: AmirrorRequest = await request.json()
    const { message, imageData, conversationHistory = [] } = body

    if (!message && !imageData) {
      return NextResponse.json(
        { error: 'The mirror requires a subject to analyze.' },
        { status: 400 }
      )
    }

    const client = new Anthropic({ apiKey })

    // Build the messages array
    const messages: Anthropic.MessageParam[] = []

    // Add conversation history
    for (const msg of conversationHistory.slice(-6)) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })
    }

    // Build the current message content
    const currentContent: Anthropic.ContentBlockParam[] = []

    // Add image if provided
    if (imageData) {
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

    // Add the text message with clinical framing
    const textPrompt = imageData
      ? `${message || "Amirror, Amirror on the wall..."}\n\n[SUBJECT PRESENTING FOR FACIAL ANALYSIS. Deliver your clinical assessment of their facial structure, proportions, and aesthetic markers. Be thorough but efficient.]`
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
      max_tokens: 400,
      temperature: 0.8,
      system: AMIRROR_SYSTEM,
      messages
    })

    // Extract text from response
    const textBlock = response.content.find(block => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(
        { error: 'The mirror sees nothing worth commenting on.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      response: textBlock.text,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Amirror API error:', error)

    const errorMessages = [
      "The mirror's clarity has temporarily failed. The spirits are... recalibrating.",
      "Even ancient magic has its limits. Try again.",
      "The connection to the other side has been disrupted.",
      "Analysis interrupted. Perhaps some truths are not meant to be known today."
    ]

    return NextResponse.json(
      { error: errorMessages[Math.floor(Math.random() * errorMessages.length)] },
      { status: 500 }
    )
  }
}
