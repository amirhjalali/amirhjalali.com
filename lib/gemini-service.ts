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
 * Build the prompt for article generation
 */
function buildPrompt(topic: string, referenceContext: string, additionalInstructions?: string): string {
    let prompt = `Write an article about "${topic}".`;

    if (referenceContext) {
        prompt += `\n\nReference materials to incorporate (cite naturally within the writing):\n\n---\n\n${referenceContext}\n\n---\n\n`;
    }

    if (additionalInstructions) {
        prompt += `\nAdditional Context:\n${additionalInstructions}`;
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
