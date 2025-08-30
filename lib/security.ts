// Security utilities for protecting the application

// Sanitize user input to prevent XSS
export const sanitizeInput = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// Content Security Policy headers
export const CSP_HEADERS = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'https://www.googletagmanager.com'],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'connect-src': ["'self'", 'https://api.openai.com', 'https://www.google-analytics.com'],
  'frame-src': ["'self'", 'https://calendly.com'],
};

// Generate CSP header string
export const generateCSP = (): string => {
  return Object.entries(CSP_HEADERS)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
};

// Rate limiting configuration
export const RATE_LIMITS = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Max requests per window
  },
  auth: {
    windowMs: 15 * 60 * 1000,
    max: 5,
  },
  generate: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
  },
};