import { AIMetadata } from '@/lib/types';

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

interface ArticleContent {
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
}

export async function generateArticleContent(options: AIMetadata): Promise<ArticleContent> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const topic = options.topic || TOPICS[Math.floor(Math.random() * TOPICS.length)];
    const model = options.textModel || 'gpt-4o-mini';

    // TODO: Add support for Claude and Gemini when keys are available
    if (model.startsWith('claude') || model.startsWith('gemini')) {
        // For now, fallback to OpenAI or throw error
        // throw new Error(`Model ${model} not yet supported`);
        console.warn(`Model ${model} requested but not fully configured. Falling back to OpenAI logic structure but using requested model name if compatible.`);
    }

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
            model: model.includes('gpt') ? model : 'gpt-4o-mini', // Fallback for now
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

export async function generateImage(title: string, options: AIMetadata): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const topic = options.topic || 'Technology';
    const style = options.imageStyle || 'abstract, contemporary, tech-focused, visually striking';
    const customPrompt = options.imagePrompt;
    const model = options.imageModel || 'dall-e-3';

    const imagePrompt = customPrompt || `Create an artistic, modern featured image for a tech blog article titled "${title}" about ${topic}. Style: ${style}. Use vibrant colors and geometric shapes.`;

    // TODO: Add support for Replicate
    if (model.includes('stable-diffusion') || model.includes('flux')) {
        // Placeholder for Replicate logic
        console.warn('Replicate models not yet configured. Falling back to DALL-E 3.');
    }

    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'dall-e-3', // Always use DALL-E 3 for now until Replicate is set up
            prompt: imagePrompt,
            n: 1,
            size: '1024x1024', // Standard DALL-E 3 size
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

export async function downloadImageAsBase64(url: string): Promise<string> {
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
