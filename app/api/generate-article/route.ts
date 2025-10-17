import { NextRequest, NextResponse } from 'next/server';

// Article generation configuration
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
  'Tech industry trends'
];

// Generate article using Anthropic (Claude)
async function generateWithAnthropic(topic: string, apiKey: string) {
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
}

Return ONLY the JSON object, no other text.`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.8,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Anthropic API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Extract JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from Claude response');
  }

  return JSON.parse(jsonMatch[0]);
}

// Generate article using OpenAI
async function generateWithOpenAI(topic: string, apiKey: string) {
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
        { role: 'system', content: 'You are a thoughtful tech blogger who writes engaging, insightful articles about AI and technology.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      response_format: { type: "json_object" }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${error}`);
  }

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

// Calculate reading time
function calculateReadTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// Generate unique ID
function generateId(): string {
  return `article-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic, provider = 'anthropic' } = body;

    // Get API key from environment
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!anthropicKey && !openaiKey) {
      return NextResponse.json(
        { error: 'No API keys configured. Please set ANTHROPIC_API_KEY or OPENAI_API_KEY.' },
        { status: 500 }
      );
    }

    // Select topic
    const selectedTopic = topic || TOPICS[Math.floor(Math.random() * TOPICS.length)];

    console.log(`Generating article about: "${selectedTopic}"`);

    // Generate article
    let articleData;
    let model: string;

    if (provider === 'anthropic' && anthropicKey) {
      articleData = await generateWithAnthropic(selectedTopic, anthropicKey);
      model = 'claude-3-5-sonnet';
    } else if (provider === 'openai' && openaiKey) {
      articleData = await generateWithOpenAI(selectedTopic, openaiKey);
      model = 'gpt-4o-mini';
    } else if (anthropicKey) {
      // Fallback to Anthropic if specified provider isn't available
      articleData = await generateWithAnthropic(selectedTopic, anthropicKey);
      model = 'claude-3-5-sonnet';
    } else if (openaiKey) {
      // Fallback to OpenAI
      articleData = await generateWithOpenAI(selectedTopic, openaiKey);
      model = 'gpt-4o-mini';
    } else {
      return NextResponse.json(
        { error: 'No valid API configuration found.' },
        { status: 500 }
      );
    }

    // Calculate metadata
    const wordCount = articleData.content.trim().split(/\s+/).length;
    const readTime = calculateReadTime(articleData.content);

    // Build article object
    const article = {
      id: generateId(),
      title: articleData.title,
      content: articleData.content,
      excerpt: articleData.excerpt,
      tags: articleData.tags || ['AI', 'Technology'],
      imageUrl: '', // Can be added later
      aiGenerated: true,
      author: 'Amir H. Jalali',
      publishedAt: new Date().toISOString(),
      readTime: readTime,
      status: 'draft' as const,
      metadata: {
        style: 'casual',
        length: 'medium',
        wordCount: wordCount,
        generatedAt: new Date().toISOString(),
        topic: selectedTopic,
        model: model
      }
    };

    console.log(`✅ Generated article: "${article.title}" (${wordCount} words)`);

    return NextResponse.json({
      success: true,
      article: article,
      stats: {
        wordCount,
        readTime,
        model,
        topic: selectedTopic
      }
    });

  } catch (error: any) {
    console.error('Error generating article:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate article' },
      { status: 500 }
    );
  }
}

// GET endpoint to get available topics
export async function GET() {
  return NextResponse.json({
    topics: TOPICS,
    providers: {
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      openai: !!process.env.OPENAI_API_KEY
    }
  });
}
