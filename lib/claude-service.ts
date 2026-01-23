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

Examples of the target voice:
- "The biggest friction point comes when a project needs to interact with external data."
- "The immediate takeaway is that many use cases that were not deemed viable just recently, are immediately much more feasible."
- "The companies that figure out agent orchestration first will have an asymmetric advantage. Everyone else will be hiring to keep up."
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
- Length: 150-300 words. This is NOT negotiable. Shorter is better.
- NO section headers (##). Flowing short paragraphs only.
- First sentence IS the thesis. No preamble, no context-setting.
- Each paragraph: 1-3 sentences max. State fact or opinion, then move on.
- Final paragraph: one punchy forward-looking statement. Not a summary.
- The article should feel like it was written in 10 minutes by someone who knows exactly what they think.
${referenceContext ? '- Integrate reference material as supporting evidence, cited naturally' : ''}

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
            system: `You are writing as Amir H. Jalali - someone who builds with AI daily and shares sharp, brief observations about what's actually happening in tech. Your articles are 150-300 words, use ALL CAPS titles, and every sentence says something specific. You never pad, never hedge, never explain basics. You name exact tools and take clear positions.`,
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
