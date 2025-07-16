import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface GenerateRequest {
  audioFile?: File
  prompt?: string
  type: 'voice' | 'text'
  style?: 'technical' | 'casual' | 'professional' | 'creative'
  length?: 'short' | 'medium' | 'long'
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const type = formData.get('type') as string
    const style = formData.get('style') as string || 'professional'
    const length = formData.get('length') as string || 'medium'

    let transcription = ''

    if (type === 'voice') {
      // Handle voice file upload and transcription
      const audioFile = formData.get('audioFile') as File
      
      if (!audioFile) {
        return NextResponse.json(
          { error: 'No audio file provided' },
          { status: 400 }
        )
      }

      // Transcribe audio using Whisper
      const transcriptionResponse = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'text',
      })

      transcription = transcriptionResponse as string
    } else {
      // Handle text prompt
      const prompt = formData.get('prompt') as string
      if (!prompt) {
        return NextResponse.json(
          { error: 'No prompt provided' },
          { status: 400 }
        )
      }
      transcription = prompt
    }

    // Generate article content using GPT-4
    const articlePrompt = createArticlePrompt(transcription, style, length)
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content writer specializing in AI and technology. You create engaging, well-structured articles with clear headings, compelling introductions, and actionable insights.'
        },
        {
          role: 'user',
          content: articlePrompt
        }
      ],
      temperature: 0.7,
      max_tokens: getMaxTokens(length),
    })

    const articleContent = completion.choices[0].message.content

    if (!articleContent) {
      return NextResponse.json(
        { error: 'Failed to generate article content' },
        { status: 500 }
      )
    }

    // Parse the generated content to extract title and content
    const { title, content, excerpt, tags } = parseArticleContent(articleContent)

    // Generate an image for the article using DALL-E
    let imageUrl = null
    try {
      const imagePrompt = createImagePrompt(title, content)
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: imagePrompt,
        size: '1024x1024',
        quality: 'standard',
        style: 'vivid',
      })
      
      imageUrl = imageResponse.data[0].url
    } catch (imageError) {
      console.error('Image generation failed:', imageError)
      // Continue without image if generation fails
    }

    // Return the generated article
    return NextResponse.json({
      success: true,
      article: {
        title,
        content,
        excerpt,
        tags,
        imageUrl,
        transcription: type === 'voice' ? transcription : undefined,
        metadata: {
          style,
          length,
          generatedAt: new Date().toISOString(),
          wordCount: content.split(' ').length,
          readingTime: Math.ceil(content.split(' ').length / 200), // Average reading speed
        }
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function createArticlePrompt(transcription: string, style: string, length: string): string {
  const lengthInstructions = {
    short: '400-600 words',
    medium: '800-1200 words',
    long: '1500-2500 words'
  }

  const styleInstructions = {
    technical: 'technical and detailed, with code examples where appropriate',
    casual: 'conversational and approachable, like talking to a friend',
    professional: 'professional and authoritative, suitable for business contexts',
    creative: 'creative and engaging, with storytelling elements'
  }

  return `
Transform the following input into a well-structured, engaging article:

INPUT: "${transcription}"

REQUIREMENTS:
- Length: ${lengthInstructions[length as keyof typeof lengthInstructions]}
- Style: ${styleInstructions[style as keyof typeof styleInstructions]}
- Format: Use Markdown formatting
- Structure: Include clear headings, subheadings, and logical flow
- Include: Introduction, main content sections, and conclusion
- SEO: Naturally incorporate relevant keywords

Please format the response as follows:
TITLE: [Compelling article title]
EXCERPT: [2-3 sentence summary for preview]
TAGS: [5-7 relevant tags, comma-separated]
CONTENT: [Full article content in Markdown]

Focus on creating valuable, actionable content that readers will find genuinely useful.
`
}

function createImagePrompt(title: string, content: string): string {
  // Extract key concepts from title and content for image generation
  const keyWords = title.toLowerCase().split(' ').slice(0, 5).join(' ')
  
  return `Create a modern, professional illustration for an article titled "${title}". 
The image should be:
- Clean and minimalist design
- Technology/AI themed if relevant
- Professional and engaging
- Suitable for a blog header
- Abstract or conceptual rather than literal
- Use modern color palette with blues, greens, or purple accents
- No text in the image

Key concepts: ${keyWords}`
}

function parseArticleContent(content: string) {
  const lines = content.split('\n')
  let title = ''
  let excerpt = ''
  let tags: string[] = []
  let articleContent = ''

  let currentSection = ''
  
  for (const line of lines) {
    if (line.startsWith('TITLE:')) {
      title = line.replace('TITLE:', '').trim()
      currentSection = 'title'
    } else if (line.startsWith('EXCERPT:')) {
      excerpt = line.replace('EXCERPT:', '').trim()
      currentSection = 'excerpt'
    } else if (line.startsWith('TAGS:')) {
      const tagString = line.replace('TAGS:', '').trim()
      tags = tagString.split(',').map(tag => tag.trim())
      currentSection = 'tags'
    } else if (line.startsWith('CONTENT:')) {
      currentSection = 'content'
    } else if (currentSection === 'content' && line.trim()) {
      articleContent += line + '\n'
    }
  }

  // Fallback parsing if format is not followed
  if (!title || !articleContent) {
    const contentLines = content.split('\n').filter(line => line.trim())
    title = contentLines[0]?.replace(/^#\s*/, '') || 'Generated Article'
    articleContent = content
    excerpt = contentLines.slice(1, 3).join(' ').substring(0, 200) + '...'
    tags = ['AI', 'Technology', 'Generated']
  }

  return {
    title: title || 'Generated Article',
    content: articleContent || content,
    excerpt: excerpt || 'AI-generated article content.',
    tags: tags.length > 0 ? tags : ['AI', 'Technology']
  }
}

function getMaxTokens(length: string): number {
  switch (length) {
    case 'short': return 800
    case 'medium': return 1500
    case 'long': return 3000
    default: return 1500
  }
}