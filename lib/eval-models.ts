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
  'gpt-5.2': {
    id: 'gpt-5.2',
    provider: 'openai',
    name: 'GPT-5.2',
    model: 'gpt-5.2',
    description: 'Latest OpenAI flagship model with advanced reasoning',
    supportsImages: false,
  },
  'gpt-5.2-thinking': {
    id: 'gpt-5.2-thinking',
    provider: 'openai',
    name: 'GPT-5.2 Thinking',
    model: 'gpt-5.2-thinking',
    description: 'GPT-5.2 with extended chain-of-thought reasoning',
    supportsImages: false,
  },
  'claude-opus-4.5': {
    id: 'claude-opus-4.5',
    provider: 'anthropic',
    name: 'Claude Opus 4.5',
    model: 'claude-opus-4-5-20251101',
    description: 'Anthropic\'s most capable model for complex tasks',
    supportsImages: false,
  },
  'claude-sonnet-4': {
    id: 'claude-sonnet-4',
    provider: 'anthropic',
    name: 'Claude Sonnet 4',
    model: 'claude-sonnet-4-20250514',
    description: 'Balanced performance and speed for daily use',
    supportsImages: false,
  },
  'gemini-3-flash': {
    id: 'gemini-3-flash',
    provider: 'google',
    name: 'Gemini 3 Flash',
    model: 'gemini-3-flash-preview',
    description: 'Fast and efficient for quick generations',
    supportsImages: false,
  },
  'gemini-3-pro': {
    id: 'gemini-3-pro',
    provider: 'google',
    name: 'Gemini 3 Pro',
    model: 'gemini-3-pro-preview',
    description: 'Google\'s flagship multimodal model',
    supportsImages: false,
  },
};

export const EVAL_IMAGE_MODELS: Record<string, EvalModelConfig> = {
  'dall-e-3': {
    id: 'dall-e-3',
    provider: 'openai',
    name: 'DALL-E 3',
    model: 'dall-e-3',
    description: 'High-quality image generation with strong prompt following',
    supportsImages: true,
  },
  'gemini-3-pro-image': {
    id: 'gemini-3-pro-image',
    provider: 'google',
    name: 'Gemini 3 Pro Image',
    model: 'gemini-3-pro-image-preview',
    description: 'Native image generation from Gemini 3',
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
