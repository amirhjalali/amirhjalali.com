/**
 * Claude AI Service for article generation
 * Uses the Anthropic SDK for Claude models
 */

import Anthropic from '@anthropic-ai/sdk';
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

        const text = html
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 10000);

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
                return `## Reference ${index + 1}${ref.title ? `: ${ref.title}` : ''}\n\n${ref.content}`;
            }
        })
    );

    return processedRefs.join('\n\n---\n\n');
}

// Author voice guidelines
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
 * Generate article content using Claude
 */
export async function generateArticleWithClaude(
    options: AIMetadata
): Promise<ArticleContent> {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        throw new Error('Anthropic API key not configured. Set ANTHROPIC_API_KEY in your environment.');
    }

    const client = new Anthropic({ apiKey });

    const topic = options.topic || 'Technology and Innovation';
    const model = options.textModel?.startsWith('claude')
        ? options.textModel
        : 'claude-opus-4-5-20251101';

    // Process references if provided
    const referenceContext = await processReferences(options.references || []);

    // Build the user prompt
    let prompt = `Write an article about "${topic}".`;

    if (referenceContext) {
        prompt += `\n\nReference materials to incorporate (cite naturally within the writing):\n\n---\n\n${referenceContext}\n\n---\n\n`;
    }

    if (options.additionalInstructions) {
        prompt += `\nAdditional Context:\n${options.additionalInstructions}`;
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
${referenceContext ? '- Integrate reference material naturally as context for your thinking' : ''}

Format as JSON:
{
  "title": "ALL CAPS title, 2-6 words, direct (e.g. 'THE AGENT ECONOMY', 'REASONING MODELS')",
  "content": "Full article starting with # TITLE in all caps, then the content",
  "excerpt": "One direct sentence capturing the key point (under 160 chars, no fluff)",
  "tags": ["specific", "technical", "tags"]
}

IMPORTANT: Return ONLY valid JSON, no additional text or markdown code blocks.`;

    console.log(`Generating article with Claude model: ${model}`);
    if (options.references?.length) {
        console.log(`Processing ${options.references.length} references`);
    }

    try {
        const response = await client.messages.create({
            model,
            max_tokens: 2048,
            temperature: 0.6,
            system: `You are writing as Amir H. Jalali - a builder and thinker who uses AI tools daily and shares honest, exploratory observations about technology and its implications. Your articles are short (100-250 words), use ALL CAPS titles, and read like someone thinking out loud. You're curious, optimistic but realistic, personal, and unafraid to leave questions open. You never sound like a journalist, pundit, or product reviewer.`,
            messages: [
                {
                    role: 'user',
                    content: prompt,
                }
            ],
        });

        // Extract text from response
        const textBlock = response.content.find(block => block.type === 'text');
        if (!textBlock || textBlock.type !== 'text') {
            throw new Error('Empty response from Claude');
        }

        const text = textBlock.text.trim();

        // Parse JSON from response (handle potential markdown code blocks)
        let jsonText = text;
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
        console.error('Claude API error:', error);
        throw new Error(`Claude API error: ${error.message}`);
    }
}

/**
 * Check if Claude service is available
 */
export function isClaudeAvailable(): boolean {
    return !!process.env.ANTHROPIC_API_KEY;
}
