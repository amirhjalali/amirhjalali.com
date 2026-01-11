import { AIMetadata } from '@/lib/types';
import { generateArticleWithGemini, isGeminiAvailable } from '@/lib/gemini-service';
import { generateImageWithGemini, isGeminiImageAvailable } from '@/lib/gemini-image-service';

// Topics for article generation - focused on current AI/tech developments
const TOPICS = [
    'Latest developments in reasoning models',
    'The economics of AI deployment',
    'Shifts in programming paradigms with LLMs',
    'AI model efficiency breakthroughs',
    'Open source AI and democratization',
    'Synthetic data implications',
    'AI and human identity',
    'The future of coding with AI assistance',
    'Emerging AI architectures',
    'AI evaluation and benchmarking challenges',
    'Multimodal AI capabilities',
    'AI infrastructure and cost dynamics',
    'Chain of thought and interpretability',
    'The AI talent landscape',
    'Enterprise AI adoption patterns'
];

// Author voice guidelines based on original writing
const VOICE_GUIDELINES = `
Voice and Style Guidelines (CRITICAL - follow exactly):
- Write in a dense, observational style. Every sentence should carry information.
- Be direct and analytical. Report on phenomena rather than explain basics.
- Use technical terminology naturally without over-explaining.
- Explore deeper implications: societal impact, philosophical undertones, what this means for the future.
- Short paragraphs. No padding or filler content.
- Balanced perspective: acknowledge both opportunities and concerns.
- NO clichés, NO forced analogies, NO rhetorical questions to the reader.
- NO "What do you think?" or similar calls to action.
- First-person sparingly and only when sharing direct experience.
- Focus on what's new, what changed, and why it matters.
- End with forward-looking implications, not generic conclusions.
`;

interface ArticleContent {
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
}

export async function generateArticleContent(options: AIMetadata): Promise<ArticleContent> {
    const model = options.textModel || 'gpt-5.2';

    // Use Gemini for gemini models or when references are provided
    if (model.startsWith('gemini') || (options.references?.length && isGeminiAvailable())) {
        if (!isGeminiAvailable()) {
            throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in your environment.');
        }
        console.log(`Using Gemini for article generation (model: ${model}, references: ${options.references?.length || 0})`);
        return generateArticleWithGemini(options);
    }

    // Fall back to OpenAI
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    const topic = options.topic || TOPICS[Math.floor(Math.random() * TOPICS.length)];

    const additionalInstructions = options.additionalInstructions ? `\nAdditional Context:\n${options.additionalInstructions}` : '';
    const prompt = `Write an article about "${topic}".${additionalInstructions}

${VOICE_GUIDELINES}

Structure:
- Length: 400-600 words (dense, no filler)
- NO section headers (##) - write flowing prose like an essay or editorial
- Open by stating the core development or shift immediately (no preamble)
- Develop the analysis through connected paragraphs, not labeled sections
- Close with forward-looking implications (no "In conclusion" or similar phrases)
- Use paragraph breaks naturally, not as section dividers

Format as JSON:
{
  "title": "Direct, informative title (no clickbait, no questions)",
  "content": "Full article in markdown",
  "excerpt": "One dense sentence capturing the key insight (under 160 chars)",
  "tags": ["relevant", "technical", "tags"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model.includes('gpt') ? model : 'gpt-5.2', // Use GPT-5.2 by default
            messages: [
                {
                    role: 'system',
                    content: `You are writing as Amir H. Jalali, Co-Founder & CPO at Gabooja with 14+ years in data engineering and AI strategy. Your writing style is:
- Dense and analytical, not conversational
- Technical but accessible to informed readers
- Focused on implications and what matters, not explanations of basics
- Direct observations, minimal personal pronouns
- No fluff, no clichés, no rhetorical questions
- Every sentence carries information

Think of pieces in The Economist or Stratechery - informed analysis, not blog posts.`
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
    const topic = options.topic || 'Technology';
    const style = options.imageStyle || 'minimal, sophisticated, dark monochromatic, subtle gradients, cinematic lighting';
    const customPrompt = options.imagePrompt;
    const model = options.imageModel || 'gpt-image-1.5';

    // Refined prompt for high-quality, minimal aesthetic that matches site design
    const imagePrompt = customPrompt || `Create an elegant, minimalist featured image for a professional tech article about ${topic}.
Visual style: ${style}.
Design direction: Ultra-minimal composition with dark background (black or very dark gray), subtle depth through lighting and gradients, sophisticated and professional aesthetic.
Avoid: bright colors, busy geometric patterns, stock photo look.
Think: Apple product photography, architectural minimalism, high-end editorial design.
The image should feel timeless and complement serif typography on a black background.`;

    // Route to Gemini for Gemini image models (Nano Banana Pro)
    if (model.startsWith('gemini')) {
        if (!isGeminiImageAvailable()) {
            console.warn('Gemini API key not configured. Falling back to DALL-E 3.');
        } else {
            console.log(`Using Gemini for image generation (model: ${model})`);
            // Gemini returns base64 data URI directly - no need to download
            return generateImageWithGemini(imagePrompt, options);
        }
    }

    // Fall back to OpenAI image generation
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not configured');

    // Determine which OpenAI image model to use
    const openaiImageModel = model.startsWith('gpt-image') ? model : 'gpt-image-1.5';
    console.log(`Using OpenAI for image generation (model: ${openaiImageModel})`);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: openaiImageModel,
            prompt: imagePrompt,
            n: 1,
            size: '1792x1024', // Landscape format (16:9-ish) for better featured image proportions
            quality: 'hd', // HD quality for professional look
            style: 'natural' // Natural for more sophisticated, subtle results
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `DALL-E API error: ${response.status}`);
    }

    const data = await response.json();
    // DALL-E returns temporary URLs that need to be downloaded and converted to base64
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
