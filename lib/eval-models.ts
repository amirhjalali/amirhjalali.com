/**
 * Model configuration for A/B evaluation system
 * These models are available for head-to-head article generation comparisons
 */

export interface EvalModelConfig {
  id: string;
  provider: 'openai' | 'anthropic' | 'google';
  name: string;          // Human-readable display name
  model: string;         // Actual API model identifier
  description: string;   // Brief description of model capabilities
  supportsImages: boolean;
}

export const EVAL_TEXT_MODELS: Record<string, EvalModelConfig> = {
  // OpenAI Models
  'gpt-5.2': {
    id: 'gpt-5.2',
    provider: 'openai',
    name: 'GPT-5.2',
    model: 'gpt-5.2',
    description: 'Latest OpenAI flagship model (400k context)',
    supportsImages: false,
  },
  'gpt-5.2-pro': {
    id: 'gpt-5.2-pro',
    provider: 'openai',
    name: 'GPT-5.2 Pro',
    model: 'gpt-5.2-pro',
    description: 'Enhanced reasoning and analysis capabilities',
    supportsImages: false,
  },
  'o4-mini': {
    id: 'o4-mini',
    provider: 'openai',
    name: 'O4 Mini',
    model: 'o4-mini',
    description: 'Fast reasoning model for efficient analysis',
    supportsImages: false,
  },
  // Anthropic Models
  'claude-opus-4.5': {
    id: 'claude-opus-4.5',
    provider: 'anthropic',
    name: 'Claude Opus 4.5',
    model: 'claude-opus-4-5-20251101',
    description: 'Anthropic\'s most capable model for complex tasks',
    supportsImages: false,
  },
  'claude-sonnet-4.5': {
    id: 'claude-sonnet-4.5',
    provider: 'anthropic',
    name: 'Claude Sonnet 4.5',
    model: 'claude-sonnet-4-5-20250929',
    description: 'Best balance of intelligence, speed, and cost',
    supportsImages: false,
  },
  'claude-haiku-4.5': {
    id: 'claude-haiku-4.5',
    provider: 'anthropic',
    name: 'Claude Haiku 4.5',
    model: 'claude-haiku-4-5-20251001',
    description: 'Fastest Claude model for real-time applications',
    supportsImages: false,
  },
  // Google Models
  'gemini-3-flash': {
    id: 'gemini-3-flash',
    provider: 'google',
    name: 'Gemini 3 Flash',
    model: 'gemini-3-flash-preview',
    description: 'Fast frontier-class performance at low cost',
    supportsImages: false,
  },
  'gemini-3-pro': {
    id: 'gemini-3-pro',
    provider: 'google',
    name: 'Gemini 3 Pro',
    model: 'gemini-3-pro-preview',
    description: 'Google\'s flagship multimodal model (1M context)',
    supportsImages: false,
  },
};

export const EVAL_IMAGE_MODELS: Record<string, EvalModelConfig> = {
  // OpenAI Image Models
  'gpt-image-1.5': {
    id: 'gpt-image-1.5',
    provider: 'openai',
    name: 'GPT Image 1.5',
    model: 'gpt-image-1.5',
    description: 'Latest OpenAI image model with superior quality',
    supportsImages: true,
  },
  'gpt-image-1': {
    id: 'gpt-image-1',
    provider: 'openai',
    name: 'GPT Image 1',
    model: 'gpt-image-1',
    description: 'Standard GPT-powered image generation',
    supportsImages: true,
  },
  'dall-e-3': {
    id: 'dall-e-3',
    provider: 'openai',
    name: 'DALL-E 3',
    model: 'dall-e-3',
    description: 'Legacy image model (deprecated May 2026)',
    supportsImages: true,
  },
  // Google Image Models
  'gemini-3-pro-image': {
    id: 'gemini-3-pro-image',
    provider: 'google',
    name: 'Nano Banana Pro',
    model: 'gemini-3-pro-image-preview',
    description: 'High-fidelity image generation with text rendering',
    supportsImages: true,
  },
  'imagen-4': {
    id: 'imagen-4',
    provider: 'google',
    name: 'Imagen 4',
    model: 'imagen-4.0-generate-001',
    description: 'Google\'s latest high-quality image generator',
    supportsImages: true,
  },
};

// Get all available text models as array for dropdowns
export function getTextModelOptions(): { value: string; label: string; description: string }[] {
  return Object.values(EVAL_TEXT_MODELS).map(m => ({
    value: m.id,
    label: m.name,
    description: m.description,
  }));
}

// Get all available image models as array for dropdowns
export function getImageModelOptions(): { value: string; label: string; description: string }[] {
  return Object.values(EVAL_IMAGE_MODELS).map(m => ({
    value: m.id,
    label: m.name,
    description: m.description,
  }));
}

// Check if a model is available (has required API key)
export function isModelAvailable(modelId: string): boolean {
  const config = EVAL_TEXT_MODELS[modelId] || EVAL_IMAGE_MODELS[modelId];
  if (!config) return false;

  switch (config.provider) {
    case 'openai':
      return !!process.env.OPENAI_API_KEY;
    case 'anthropic':
      return !!process.env.ANTHROPIC_API_KEY;
    case 'google':
      return !!process.env.GEMINI_API_KEY;
    default:
      return false;
  }
}

// Generate a unique eval group ID
export function generateEvalGroupId(): string {
  const date = new Date().toISOString().split('T')[0];
  const random = Math.random().toString(36).substring(2, 6);
  return `eval-${date}-${random}`;
}

// Generate a unique comparison pair ID
export function generateComparisonPairId(): string {
  return `pair-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}
