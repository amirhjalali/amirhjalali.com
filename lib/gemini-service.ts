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

/**
 * Build the prompt for article generation
 */
function buildPrompt(topic: string, referenceContext: string, additionalInstructions?: string): string {
    let prompt = `Write a thoughtful, engaging article about "${topic}".`;

    if (referenceContext) {
        prompt += `\n\nI'm providing you with reference materials below. Please incorporate insights, data, and perspectives from these references into your article. Cite or reference the source material naturally within your writing.\n\n---\n\n${referenceContext}\n\n---\n\n`;
    }

    if (additionalInstructions) {
        prompt += `\nAdditional Instructions:\n${additionalInstructions}`;
    }

    prompt += `

Requirements:
- Length: 600-800 words
- Tone: Casual and conversational, like a personal blog post
- Structure: Include 2-3 main sections with headers (use ## for markdown headers)
- Style: Share personal insights and observations
- Include practical examples or analogies
- End with a thought-provoking conclusion
${referenceContext ? '- Naturally integrate information from the provided references' : ''}

Format the response as a JSON object with:
{
  "title": "Article title (engaging and clickable)",
  "content": "Full article content in markdown format with headers",
  "excerpt": "Brief 2-sentence summary (100-150 chars)",
  "tags": ["array", "of", "relevant", "tags"]
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
        : 'gemini-2.0-flash'; // Gemini 2.0 Flash - Released Dec 2024, 2x faster than 1.5 Pro

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
