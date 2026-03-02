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
- Em dashes (—) or double dashes (--). Restructure sentences instead. Use periods, commas, or separate sentences.

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
    const model = options.textModel || 'claude-opus-4-6';

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
- Length: 400-800 words. Concise but substantive — every sentence earns its place.
- NO section headers (##). Flowing short paragraphs only.
- Start with what you've observed or what's happening - set the scene briefly then explore.
- Each paragraph: 1-3 sentences. Keep it tight and conversational.
- Use specific data points, company names, research findings to ground your observations.
- End with a forward-looking thought, an open question, or genuine ambivalence.
- The article should feel like a practitioner who builds with these tools daily, sharing hard-won observations.
- Hold tension open rather than resolving it. Both sides of an argument can be true.

Format as JSON:
{
  "title": "ALL CAPS title, 2-6 words, direct (e.g. 'THE AGENT ECONOMY', 'REASONING MODELS')",
  "content": "Full article text. Do NOT include the title as a heading — it is rendered separately. Just the body paragraphs.",
  "excerpt": "One direct sentence capturing the key insight (120-155 chars for optimal SERP display, no fluff)",
  "tags": ["specific", "technical", "tags", "use 3-5 tags"]
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
                    content: `You are writing as Amir H. Jalali - an AI strategy consultant and builder who uses AI tools daily and shares honest, exploratory observations about technology and its implications. Your articles are substantive essays (800-2000 words), use ALL CAPS titles, and read like a practitioner thinking out loud. You're curious, genuinely ambivalent about outcomes, personal, and unafraid to leave questions open. You ground observations in specific data and real examples. You never sound like a journalist, pundit, LinkedIn influencer, or product reviewer.`
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

export async function generateImage(title: string, options: AIMetadata & { excerpt?: string }): Promise<string> {
    const topic = options.topic || 'Technology';
    const style = options.imageStyle || 'editorial photography, cinematic lighting, dark monochromatic';
    const customPrompt = options.imagePrompt;
    const model = options.imageModel || 'gemini-3.1-flash-image-preview';
    const resolution = options.imageResolution || '1K';

    // Build content context from available article data
    const contextLine = options.excerpt
        ? `\nArticle summary: ${options.excerpt}`
        : '';

    // Content-aware prompt: use title, topic, and excerpt to create images that relate to the article
    const imagePrompt = customPrompt || `Create a featured image for an article titled "${title}" about ${topic}.${contextLine}

The image should visually represent the specific subject matter — not abstract shapes.
Think editorially: if this were a New York Times or Wired feature, what photograph or illustration would accompany this piece?
Use a real-world visual metaphor or scene that connects to the article's theme.

Visual constraints:
- Dark background (black or very dark gray) with cinematic lighting
- ${style}
- No text, no words, no UI elements, no logos
- No abstract geometric patterns or generic tech imagery
- The image should tell a story related to "${topic}"

Think: Wired magazine photography, Bloomberg editorial imagery, cinematic documentary stills.`;

    // Route to Gemini for Gemini image models (Nano Banana 2)
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
    const originalBuffer = Buffer.from(arrayBuffer);

    // Convert to WebP for smaller file size
    try {
        const sharp = (await import('sharp')).default;
        const webpBuffer = await sharp(originalBuffer)
            .webp({ quality: 85 })
            .toBuffer();
        return `data:image/webp;base64,${webpBuffer.toString('base64')}`;
    } catch {
        // If sharp is not available or conversion fails, use original format
        const base64 = originalBuffer.toString('base64');
        const contentType = response.headers.get('content-type') || 'image/png';
        return `data:${contentType};base64,${base64}`;
    }
}
