import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getSession } from '@/app/actions/auth';

/**
 * Server-side API route for generating articles
 * This keeps the OpenAI API key secure and never exposed to the client
 */

// Topics for article generation
const TOPICS = [
  'AI and creativity',
  'Future of work with AI',
  'Ethics in AI development',
  'AI in education',
  'Human-AI collaboration',
  'Machine learning breakthroughs',
  'AI and society',
  'Programming paradigms',
  'Developer productivity',
  'Tech industry trends',
  'AI coding assistants',
  'Next.js and React patterns',
  'TypeScript best practices',
  'Web performance optimization',
  'Accessibility in web development'
];

async function generateArticleContent(topic: string, apiKey: string) {
  const prompt = `Write a thoughtful, engaging article about "${topic}".

Requirements:
- Length: 600-800 words
- Tone: Casual and conversational, like a personal blog post
- Structure: Include 2-3 main sections with headers (use ## for markdown headers)
- Style: Share personal insights and observations
- Include practical examples or analogies
- End with a thought-provoking conclusion

Format the response as a JSON object with:
{
  "title": "Article title (engaging and clickable)",
  "content": "Full article content in markdown format with headers",
  "excerpt": "Brief 2-sentence summary (100-150 chars)",
  "tags": ["array", "of", "relevant", "tags"]
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a thoughtful tech blogger who writes engaging, insightful articles about AI and technology.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function generateImage(title: string, topic: string, apiKey: string): Promise<string> {
  const imagePrompt = `Create an artistic, modern featured image for a tech blog article titled "${title}" about ${topic}. Style: abstract, contemporary, tech-focused, visually striking. Use vibrant colors and geometric shapes.`;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: imagePrompt,
      n: 1,
      size: '1792x1024',
      quality: 'standard',
      style: 'vivid'
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `DALL-E API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].url;
}

async function downloadImageAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const base64 = buffer.toString('base64');
  const contentType = response.headers.get('content-type') || 'image/png';

  return `data:${contentType};base64,${base64}`;
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get API key from environment (server-side only, never exposed to client)
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured on server. Set OPENAI_API_KEY in environment variables.' },
        { status: 500 }
      );
    }

    const { customTopic } = await request.json().catch(() => ({}));

    // Select topic
    const topic = customTopic || TOPICS[Math.floor(Math.random() * TOPICS.length)];

    // Generate article content
    const articleData = await generateArticleContent(topic, apiKey);

    // Generate image
    const imageUrl = await generateImage(articleData.title, topic, apiKey);

    // Download image as base64
    const imageBase64 = await downloadImageAsBase64(imageUrl);

    // Calculate word count
    const wordCount = articleData.content.trim().split(/\s+/).length;

    // Save directly to database as draft
    const draft = await prisma.draft.create({
      data: {
        title: articleData.title,
        content: articleData.content,
        excerpt: articleData.excerpt,
        tags: articleData.tags || ['AI', 'Technology'],
        imageUrl: imageBase64,
        aiGenerated: true,
      }
    });

    return NextResponse.json({
      success: true,
      draft,
      topic,
      wordCount,
      message: 'Article generated and saved as draft'
    });

  } catch (error: any) {
    console.error('Article generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate article' },
      { status: 500 }
    );
  }
}
