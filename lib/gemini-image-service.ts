/**
 * Gemini Image Generation Service
 * Uses Nano Banana Pro (Gemini 3 Pro Image) for high-quality image generation
 * Supports 1K, 2K, and 4K resolutions
 */

import { GoogleGenAI } from '@google/genai';
import { AIMetadata } from './types';

/**
 * Resolution configurations for Gemini image generation
 */
const RESOLUTION_CONFIG = {
  '1K': { width: 1024, height: 1024 },
  '2K': { width: 2048, height: 2048 },
  '4K': { width: 4096, height: 4096 },
};

/**
 * Generate an image using Gemini's Nano Banana Pro model
 *
 * @param prompt - The image generation prompt
 * @param options - Generation options including model, resolution, and style
 * @returns URL of the generated image
 */
export async function generateImageWithGemini(
  prompt: string,
  options: AIMetadata = {}
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key not configured. Set GEMINI_API_KEY in your environment.');
  }

  const ai = new GoogleGenAI({ apiKey });

  // Determine model (default to Nano Banana Pro)
  const model = options.imageModel?.startsWith('gemini')
    ? options.imageModel
    : 'gemini-3-pro-image-preview'; // Nano Banana Pro

  // Determine resolution (default to 2K for balanced quality/cost)
  const resolution = options.imageResolution || '2K';
  const { width, height } = RESOLUTION_CONFIG[resolution];

  // Build enhanced prompt with style guidance
  let enhancedPrompt = prompt;
  if (options.imageStyle) {
    enhancedPrompt = `${prompt}. Style: ${options.imageStyle}`;
  }
  if (options.imagePrompt) {
    enhancedPrompt = options.imagePrompt; // Use custom prompt if provided
  }

  console.log(`Gemini image generation requested: ${model} at ${resolution} resolution (${width}x${height})`);

  // TODO: Implement Gemini image generation when API is available
  // The Google GenAI SDK's image generation API structure needs to be verified
  // For now, we'll throw an error to fallback to DALL-E
  throw new Error(
    'Gemini image generation is not yet fully implemented. ' +
    'The Google GenAI SDK API structure for image generation needs verification. ' +
    'Falling back to DALL-E 3 for now.'
  );

  // Commented out until we can verify the correct API structure:
  /*
  try {
    const response = await ai.models.generateImages({
      model,
      prompt: enhancedPrompt,
      // Config structure needs to be verified against actual SDK
    });

    if (!response?.images?.[0]?.imageUrl) {
      throw new Error('No image URL returned from Gemini');
    }

    const imageUrl = response.images[0].imageUrl;
    console.log(`Image generated successfully: ${imageUrl.substring(0, 50)}...`);

    return imageUrl;

  } catch (error: any) {
    console.error('Gemini Image API error:', error);
    throw new Error(`Gemini Image API error: ${error.message}`);
  }
  */
}

/**
 * Check if Gemini image generation is available
 */
export function isGeminiImageAvailable(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

/**
 * Get estimated cost for image generation
 * Based on Google's pricing (~$0.067 per 2K image)
 */
export function getEstimatedCost(resolution: '1K' | '2K' | '4K'): number {
  const costs = {
    '1K': 0.03,   // ~$0.030 per image
    '2K': 0.067,  // ~$0.067 per image
    '4K': 0.12,   // ~$0.120 per image (estimated)
  };
  return costs[resolution];
}
