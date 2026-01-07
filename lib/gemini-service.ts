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
You are writing as Amir H. Jalali, Co-Founder & CPO at Gabooja with 14+ years in data engineering and AI strategy.

Style:
- Dense and analytical, not conversational
- Technical but accessible to informed readers
- Focused on implications and what matters, not explanations of basics
- Direct observations, minimal personal pronouns
- No fluff, no clichés, no rhetorical questions
- Every sentence carries information
- Explore deeper implications: societal impact, philosophical undertones
- Balanced perspective: acknowledge both opportunities and concerns
- NO "What do you think?" or similar calls to action
- End with forward-looking implications, not generic conclusions

Think of pieces in The Economist or Stratechery - informed analysis, not blog posts.
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
- Length: 400-600 words (dense, no filler)
- NO section headers (##) - write flowing prose like an essay or editorial
- Open by stating the core development or shift immediately (no preamble)
- Develop the analysis through connected paragraphs, not labeled sections
- Close with forward-looking implications (no "In conclusion" or similar phrases)
- Use paragraph breaks naturally, not as section dividers
${referenceContext ? '- Integrate reference material as supporting evidence' : ''}

Format as JSON:
{
  "title": "Direct, informative title (no clickbait, no questions)",
  "content": "Full article in markdown",
  "excerpt": "One dense sentence capturing the key insight (under 160 chars)",
  "tags": ["relevant", "technical", "tags"]
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
                temperature: 0.8,
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
