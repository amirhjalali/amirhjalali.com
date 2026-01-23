import { AIMetadata } from '@/lib/types';
import { generateArticleWithGemini, isGeminiAvailable } from '@/lib/gemini-service';
import { generateImageWithGemini, isGeminiImageAvailable } from '@/lib/gemini-image-service';
import { generateArticleWithClaude, isClaudeAvailable } from '@/lib/claude-service';

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

You are writing as someone who USES these tools daily, not someone reviewing them from a distance.

Tone:
- Direct assertions. State what happened, what it means, move on.
- Short paragraphs (1-3 sentences each). Never more than 4 sentences.
- Name specific tools, models, companies. Never be generic.
- Take a clear position. No "on one hand... on the other hand" hedging.
- Conversational authority - a practitioner sharing observations, not an analyst writing a paper.
- Every sentence carries new information. Zero filler.

NEVER do:
- Analogies or metaphors ("it's like cooking", "GPS for imagination")
- Rhetorical questions ("So what does this mean?")
- Throat-clearing ("Let's dive in", "It's worth noting", "In today's landscape")
- Generic observations anyone could make
- Academic language ("bifurcating trajectory", "anthropocentric monopoly")
- "Balanced perspective" padding - just say what you think
- Conclusion paragraphs that restate what you already said
- Exclamation marks

DO:
- Start with the core assertion immediately (no preamble)
- Name specific tools: "Devin, Claude Code, Cursor" not "AI coding assistants"
- End with a punchy forward-looking statement
- Use short declarative sentences
- Include one strong opinion per article

Examples of YOUR voice:
- "The biggest friction point comes when a project needs to interact with external data."
- "The immediate takeaway is that many use cases that were not deemed viable just recently, are immediately much more feasible."
- "The companies that figure out agent orchestration first will have an asymmetric advantage. Everyone else will be hiring to keep up."
`;

interface ArticleContent {
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
}

export async function generateArticleContent(options: AIMetadata): Promise<ArticleContent> {
    const model = options.textModel || 'claude-opus-4-5-20251101';

    // Use Claude for claude models (default)
    if (model.startsWith('claude')) {
        if (!isClaudeAvailable()) {
            throw new Error('Anthropic API key not configured. Set ANTHROPIC_API_KEY in your environment.');
        }
        console.log(`Using Claude for article generation (model: ${model}, references: ${options.references?.length || 0})`);
        return generateArticleWithClaude(options);
    }

    // Use Gemini for gemini models
    if (model.startsWith('gemini')) {
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
- Length: 150-300 words. This is NOT negotiable. Shorter is better.
- NO section headers (##). Flowing short paragraphs only.
- First sentence IS the thesis. No preamble, no context-setting.
- Each paragraph: 1-3 sentences max. State fact or opinion, then move on.
- Final paragraph: one punchy forward-looking statement. Not a summary.
- The article should feel like it was written in 10 minutes by someone who knows exactly what they think.

Format as JSON:
{
  "title": "ALL CAPS title, 2-6 words, direct (e.g. 'THE AGENT ECONOMY', 'REASONING MODELS')",
  "content": "Full article starting with # TITLE in all caps, then the content",
  "excerpt": "One direct sentence capturing the key point (under 160 chars, no fluff)",
  "tags": ["specific", "technical", "tags"]
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
                    content: `You are writing as Amir H. Jalali - someone who builds with AI daily and shares sharp, brief observations about what's actually happening in tech. You write like a practitioner, not a journalist or academic. Your articles are 150-300 words, use ALL CAPS titles, and every sentence says something specific. You never pad, never hedge, never explain basics. You name exact tools and take clear positions.`
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
    const model = options.imageModel || 'gemini-3-pro-image-preview';
    const resolution = options.imageResolution || '1K';

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
            console.warn('Gemini API key not configured. Falling back to OpenAI.');
        } else {
            console.log(`Using Gemini for image generation (model: ${model}, resolution: ${resolution})`);
            // Gemini returns base64 data URI directly - no need to download
            return generateImageWithGemini(imagePrompt, { ...options, imageResolution: resolution });
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
            quality: 'high'
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
