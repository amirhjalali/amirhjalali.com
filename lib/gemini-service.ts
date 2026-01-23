/**
 * Gemini AI Service for article generation with references
 * Uses the @google/genai SDK for Gemini 2.5 models
 */

import { GoogleGenAI } from '@google/genai';
import { AIMetadata, Reference } from './types';

interface ArticleContent {
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
}

/**
 * Fetch content from a URL for use as reference context
 */
async function fetchUrlContent(url: string): Promise<string> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; ArticleBot/1.0)',
            },
        });

        if (!response.ok) {
            console.warn(`Failed to fetch ${url}: ${response.status}`);
            return `[Could not fetch content from: ${url}]`;
        }

        const html = await response.text();

        // Basic HTML to text conversion - strip tags and clean up
        const text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 10000); // Limit to ~10k chars per reference

        return text;
    } catch (error) {
        console.error(`Error fetching URL ${url}:`, error);
        return `[Error fetching content from: ${url}]`;
    }
}

/**
 * Process references into context text
 */
async function processReferences(references: Reference[]): Promise<string> {
    if (!references || references.length === 0) {
        return '';
    }

    const processedRefs = await Promise.all(
        references.map(async (ref, index) => {
            if (ref.type === 'url') {
                const content = await fetchUrlContent(ref.content);
                return `## Reference ${index + 1}${ref.title ? `: ${ref.title}` : ''}\nSource: ${ref.content}\n\n${content}`;
            } else {
                // Text reference
                return `## Reference ${index + 1}${ref.title ? `: ${ref.title}` : ''}\n\n${ref.content}`;
            }
        })
    );

    return processedRefs.join('\n\n---\n\n');
}

// Author voice guidelines based on original writing style
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

/**
 * Build the prompt for article generation
 */
function buildPrompt(topic: string, referenceContext: string, additionalInstructions?: string): string {
    let prompt = `Write an article about "${topic}".`;

    if (referenceContext) {
        prompt += `\n\nIMPORTANT: The article MUST be based on and discuss the following reference material. Read it carefully and write your article as a reaction to, commentary on, or exploration of what you find here. Do not ignore this content:\n\n---\n\n${referenceContext}\n\n---\n\n`;
    }

    if (additionalInstructions) {
        prompt += `\nAdditional Context:\n${additionalInstructions}`;
    }

    prompt += `

${VOICE_GUIDELINES}

Structure:
- Length: 100-250 words. Shorter is better. Some articles can be 60 words if the idea is simple.
- NO section headers (##). Flowing short paragraphs only.
- Start with what you've observed or what's happening - set the scene briefly then explore.
- Each paragraph: 1-3 sentences. Keep it conversational.
- End with a forward-looking thought, an open question, or a hopeful possibility.
- The article should feel like a curious person sharing what they've been thinking about.
${referenceContext ? '- Your article must directly engage with the reference material — discuss what it says, react to it, build on it. The reference is the starting point, not optional context.' : ''}

Format as JSON:
{
  "title": "ALL CAPS title, 2-6 words, direct (e.g. 'THE AGENT ECONOMY', 'REASONING MODELS')",
  "content": "Full article starting with # TITLE in all caps, then the content",
  "excerpt": "One direct sentence capturing the key point (under 160 chars, no fluff)",
  "tags": ["specific", "technical", "tags"]
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown code blocks.`;

    return prompt;
}

/**
 * Generate article content using Gemini with optional references
 */
export async function generateArticleWithGemini(
    options: AIMetadata
): Promise<ArticleContent> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in your environment.');
    }

    const ai = new GoogleGenAI({ apiKey });

    const topic = options.topic || 'Technology and Innovation';
    const model = options.textModel?.startsWith('gemini')
        ? options.textModel
        : 'gemini-3-flash-preview'; // Gemini 3 Flash - Latest model with Pro-level intelligence

    // Process references if provided
    const referenceContext = await processReferences(options.references || []);

    // Build the prompt
    const prompt = buildPrompt(topic, referenceContext, options.additionalInstructions);

    console.log(`Generating article with Gemini model: ${model}`);
    if (options.references?.length) {
        console.log(`Processing ${options.references.length} references`);
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
                temperature: 0.6,
            }
        });

        // Get the text response
        const text = response.text;

        if (!text) {
            throw new Error('Empty response from Gemini');
        }

        // Parse JSON from response (handle potential markdown code blocks)
        let jsonText = text.trim();
        if (jsonText.startsWith('```json')) {
            jsonText = jsonText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
        } else if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```\n?/, '').replace(/\n?```$/, '');
        }

        const articleData = JSON.parse(jsonText);

        return {
            title: articleData.title,
            content: articleData.content,
            excerpt: articleData.excerpt,
            tags: articleData.tags || ['AI', 'Technology']
        };
    } catch (error: any) {
        console.error('Gemini API error:', error);
        throw new Error(`Gemini API error: ${error.message}`);
    }
}

/**
 * Check if Gemini service is available
 */
export function isGeminiAvailable(): boolean {
    return !!process.env.GEMINI_API_KEY;
}
