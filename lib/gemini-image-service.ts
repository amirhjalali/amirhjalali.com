/**
 * Gemini Image Generation Service
 * Uses Nano Banana Pro (Gemini 3 Pro Image) for high-quality image generation
 * Supports 1K, 2K, and 4K resolutions
 */

import { GoogleGenAI, Modality } from '@google/genai';
import { AIMetadata } from './types';

/**
 * Generate an image using Gemini's Nano Banana Pro model
 *
 * Uses the generateContent API with IMAGE response modality
 * Returns base64-encoded image data
 *
 * @param prompt - The image generation prompt
 * @param options - Generation options including model, resolution, and style
 * @returns Base64 data URI of the generated image
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
  const imageSize = options.imageResolution || '2K';

  // Build enhanced prompt with style guidance
  let enhancedPrompt = prompt;
  if (options.imageStyle) {
    enhancedPrompt = `${prompt}. Style: ${options.imageStyle}`;
  }
  if (options.imagePrompt) {
    enhancedPrompt = options.imagePrompt; // Use custom prompt if provided
  }

  console.log(`Gemini image generation requested: ${model} at ${imageSize} resolution`);

  try {
    // Use generateContent with IMAGE response modality
    const response = await ai.models.generateContent({
      model,
      contents: enhancedPrompt,
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: {
          aspectRatio: '16:9', // Landscape format for featured images
          imageSize, // '1K', '2K', or '4K'
        },
      },
    });

    // Extract image from response parts
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part: any) => part.inlineData?.mimeType?.startsWith('image/')
    );

    if (!imagePart?.inlineData?.data) {
      throw new Error('No image data returned from Gemini');
    }

    // Return as base64 data URI
    const mimeType = imagePart.inlineData.mimeType || 'image/png';
    const base64Data = imagePart.inlineData.data;
    const dataUri = `data:${mimeType};base64,${base64Data}`;

    console.log(`Image generated successfully with Gemini (${imageSize})`);

    return dataUri;

  } catch (error: any) {
    console.error('Gemini Image API error:', error);
    throw new Error(`Gemini Image API error: ${error.message}`);
  }
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
