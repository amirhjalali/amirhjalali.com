/**
 * Amirror Frame Generation API
 *
 * Generates an ornate antique mirror frame using Gemini image generation
 * The frame is designed to overlay on top of the webcam feed
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenAI, Modality } from '@google/genai'
import fs from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 503 }
      )
    }

    const ai = new GoogleGenAI({ apiKey })

    // Prompt for generating an ornate mirror frame with transparent/black center
    const framePrompt = `Create a photorealistic ornate antique baroque mirror frame.

    The frame should be:
    - Elaborate gold or silver gilded Victorian/baroque style with intricate scrollwork
    - Heavy ornamental flourishes at corners and edges
    - Detailed carved details, leaves, flowers, classical motifs
    - Rich patina showing age and character
    - The CENTER must be completely BLACK/void (this is where the mirror glass goes)
    - Frame should have depth and dimensional shadows
    - Lighting should create dramatic highlights on the metallic frame
    - Gothic/mystical feeling, like it belongs in an old haunted mansion
    - Portrait orientation (taller than wide)

    Style: High-end product photography, dramatic lighting, black background, 8K detail`

    console.log('Generating Amirror frame with Gemini...')

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: framePrompt,
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: {
          aspectRatio: '9:16', // Portrait orientation for mirror
          imageSize: '2K',
        },
      },
    })

    // Extract image from response
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.mimeType?.startsWith('image/')
    )

    if (!imagePart?.inlineData?.data) {
      return NextResponse.json(
        { error: 'Failed to generate frame image' },
        { status: 500 }
      )
    }

    const mimeType = imagePart.inlineData.mimeType || 'image/png'
    const base64Data = imagePart.inlineData.data

    // Save to public folder
    const outputPath = path.join(process.cwd(), 'public', 'images', 'amirror-frame.png')
    const imageBuffer = Buffer.from(base64Data, 'base64')

    // Ensure directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, imageBuffer)

    console.log('Amirror frame saved to:', outputPath)

    return NextResponse.json({
      success: true,
      message: 'Frame generated successfully',
      path: '/images/amirror-frame.png',
      dataUri: `data:${mimeType};base64,${base64Data}`
    })

  } catch (error: any) {
    console.error('Frame generation error:', error)
    return NextResponse.json(
      { error: `Failed to generate frame: ${error.message}` },
      { status: 500 }
    )
  }
}

// Also support GET for easier testing
export async function GET(request: NextRequest) {
  return POST(request)
}
