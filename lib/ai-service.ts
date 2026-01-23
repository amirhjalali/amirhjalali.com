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

You are writing as a practitioner who builds with these tools daily, sharing observations and exploring ideas honestly.

Tone:
- Conversational and personal. Use "I" and "we" naturally.
- Exploratory - you're thinking out loud, not delivering a verdict.
- Optimistic but honest about limits and risks.
- Name specific tools, models, companies when relevant.
- Short paragraphs (1-3 sentences). Keep it flowing.
- Questions are welcome as thinking tools - not rhetorical flourishes but genuine exploration.

NEVER do:
- Sound like a tech pundit or journalist delivering hot takes
- Analogies or metaphors ("it's like cooking", "GPS for imagination")
- Throat-clearing ("Let's dive in", "It's worth noting", "In today's landscape")
- Academic language ("bifurcating trajectory", "anthropocentric monopoly")
- Bullet-point lists or structured breakdowns
- Conclusion paragraphs that restate what you already said
- Exclamation marks
- Product review tone (listing features, specs, ratings)

DO:
- Start with an observation or insight - what you've noticed or what's happening
- Acknowledge uncertainty when genuine ("still a bit unknown", "this seems to be")
- Share personal experience naturally ("I've been using...", "In my experience...")
- Explore both opportunity and risk without being preachy
- End with a forward-looking thought or open question
- Let some ideas remain unresolved - not everything needs a conclusion
- Keep the energy of someone who's genuinely curious, not someone performing expertise

Examples of the target voice:
- "The biggest friction point comes when a project needs to interact with external data."
- "The immediate takeaway is that many use cases that were not deemed viable just recently, are immediately much more feasible."
- "What this means for society is still a bit unknown."
- "Our best hope would be that with the additional intelligence available to us, humanity will add to our wells of wisdom."
- "As time passes we see that the real strength of generative AI is in empowering artists with tools that amplify their imaginative capacity."
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
- Length: 100-250 words. Shorter is better. Some articles can be 60 words if the idea is simple.
- NO section headers (##). Flowing short paragraphs only.
- Start with what you've observed or what's happening - set the scene briefly then explore.
- Each paragraph: 1-3 sentences. Keep it conversational.
- End with a forward-looking thought, an open question, or a hopeful possibility.
- The article should feel like a curious person sharing what they've been thinking about.

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
                    content: `You are writing as Amir H. Jalali - a builder and thinker who uses AI tools daily and shares honest, exploratory observations about technology and its implications. Your articles are short (100-250 words), use ALL CAPS titles, and read like someone thinking out loud. You're curious, optimistic but realistic, personal, and unafraid to leave questions open. You never sound like a journalist, pundit, or product reviewer.`
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
