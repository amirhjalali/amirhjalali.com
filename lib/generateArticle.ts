/**
 * Client-side article generation for admin panel
 * Uses OpenAI API to generate articles with images
 */

export interface ArticleGenerationResult {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  imageUrl: string;
  topic: string;
  wordCount: number;
}

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

/**
 * Generate article content using OpenAI
 */
async function generateArticleContent(topic: string, apiKey: string) {
  const prompt = `Write an article about "${topic}".

Requirements:
- Length: 150-300 words. Shorter is better. This is NOT negotiable.
- NO section headers. Flowing short paragraphs only.
- First sentence IS the thesis. No preamble.
- Each paragraph: 1-3 sentences max.
- Name specific tools, models, companies. Never be generic.
- Take a clear position. No hedging.
- End with a punchy forward-looking statement. Not a summary.
- NEVER use analogies, metaphors, rhetorical questions, or exclamation marks.
- NEVER use phrases like "Let's dive in", "It's worth noting", "In today's landscape".

Format the response as a JSON object with:
{
  "title": "ALL CAPS title, 2-6 words, direct (e.g. 'THE AGENT ECONOMY')",
  "content": "Full article starting with # TITLE, then paragraphs",
  "excerpt": "One direct sentence, under 160 chars, no fluff",
  "tags": ["specific", "technical", "tags"]
}`;

  let response;
  try {
    response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-5.2',
        messages: [
          {
            role: 'system',
            content: 'You are writing as Amir H. Jalali - someone who builds with AI daily and shares sharp, brief observations about what is actually happening in tech. Your articles are 150-300 words, use ALL CAPS titles, and every sentence says something specific. You never pad, never hedge, never explain basics. You name exact tools and take clear positions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.6,
        response_format: { type: "json_object" }
      })
    });
  } catch (error: any) {
    throw new Error(`Network error: ${error.message || 'Failed to connect to OpenAI API. Check your internet connection.'}`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(`OpenAI API error: ${errorMessage}`);
  }

  const data = await response.json();

  if (!data.choices || !data.choices[0]) {
    throw new Error('Invalid response from OpenAI API');
  }

  try {
    return JSON.parse(data.choices[0].message.content);
  } catch {
    throw new Error('Failed to parse article content from API response');
  }
}

/**
 * Generate featured image using DALL-E 3
 */
async function generateImage(title: string, topic: string, apiKey: string): Promise<string> {
  const imagePrompt = `Create an artistic, modern featured image for a tech blog article titled "${title}" about ${topic}. Style: abstract, contemporary, tech-focused, visually striking. Use vibrant colors and geometric shapes.`;

  let response;
  try {
    response = await fetch('https://api.openai.com/v1/images/generations', {
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
        quality: 'standard'
      })
    });
  } catch (error: any) {
    throw new Error(`Network error generating image: ${error.message || 'Failed to connect to OpenAI API'}`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || `${response.status} ${response.statusText}`;
    throw new Error(`DALL-E API error: ${errorMessage}`);
  }

  const data = await response.json();

  if (!data.data || !data.data[0] || !data.data[0].url) {
    throw new Error('Invalid response from DALL-E API');
  }

  return data.data[0].url;
}

/**
 * Download image from URL and convert to base64
 */
async function downloadImageAsBase64(url: string): Promise<string> {
  let response;
  try {
    response = await fetch(url);
  } catch (error: any) {
    throw new Error(`Failed to download image: ${error.message}`);
  }

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
  }

  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to convert image to base64'));
    reader.readAsDataURL(blob);
  });
}

/**
 * Main function to generate a complete article with image
 */
export async function generateArticle(
  customTopic?: string,
  onProgress?: (step: string) => void
): Promise<ArticleGenerationResult> {
  // Get API key from environment
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error(
      'OpenAI API key not configured.\n\n' +
      'For local development:\n' +
      '1. Create a .env.local file in the project root\n' +
      '2. Add: NEXT_PUBLIC_OPENAI_API_KEY=your_actual_api_key\n' +
      '3. Restart the development server\n\n' +
      'Get your API key from: https://platform.openai.com/api-keys'
    );
  }

  // Select topic
  const topic = customTopic || TOPICS[Math.floor(Math.random() * TOPICS.length)];
  onProgress?.(`Generating article about: ${topic}`);

  // Generate article content
  onProgress?.('Writing article content...');
  const articleData = await generateArticleContent(topic, apiKey);

  // Generate image
  onProgress?.('Creating featured image...');
  const imageUrl = await generateImage(articleData.title, topic, apiKey);

  // Download image as base64 (so it doesn't expire)
  onProgress?.('Processing image...');
  const imageBase64 = await downloadImageAsBase64(imageUrl);

  // Calculate word count
  const wordCount = articleData.content.trim().split(/\s+/).length;

  return {
    title: articleData.title,
    content: articleData.content,
    excerpt: articleData.excerpt,
    tags: articleData.tags || ['AI', 'Technology'],
    imageUrl: imageBase64, // Store as base64 data URL
    topic,
    wordCount
  };
}

/**
 * Get a random topic
 */
export function getRandomTopic(): string {
  return TOPICS[Math.floor(Math.random() * TOPICS.length)];
}
