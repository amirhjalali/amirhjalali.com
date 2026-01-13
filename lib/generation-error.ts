/**
 * Generation Error Handling
 * Captures detailed error information for failed AI generations
 */

export interface GenerationErrorDetails {
  message: string;
  code?: string;
  status?: number;
  rawResponse?: string;
  supportedValues?: string[];
  parameter?: string;
}

/**
 * Parse API error responses to extract useful details
 */
export function parseAPIError(error: unknown, rawResponse?: string): GenerationErrorDetails {
  const details: GenerationErrorDetails = {
    message: 'Unknown error occurred',
  };

  if (error instanceof Error) {
    details.message = error.message;

    // Try to extract error code from message
    const codeMatch = error.message.match(/error[:\s]+(\w+)/i);
    if (codeMatch) {
      details.code = codeMatch[1];
    }

    // Try to extract parameter name from "Unknown parameter" errors
    const paramMatch = error.message.match(/Unknown parameter[:\s]*['"]?(\w+)['"]?/i);
    if (paramMatch) {
      details.parameter = paramMatch[1];
    }

    // Try to extract supported values from error message
    const supportedMatch = error.message.match(/supported values? (?:are|is)[:\s]*([^.]+)/i);
    if (supportedMatch) {
      details.supportedValues = supportedMatch[1]
        .split(/[,\s]+/)
        .map((v) => v.trim().replace(/['"]/g, ''))
        .filter((v) => v.length > 0);
    }
  }

  if (rawResponse) {
    details.rawResponse = rawResponse;

    // Try to parse as JSON for more details
    try {
      const parsed = JSON.parse(rawResponse);
      if (parsed.error) {
        details.message = parsed.error.message || parsed.error;
        details.code = parsed.error.code || parsed.error.type;

        // Extract supported values if present
        if (parsed.error.message?.includes('supported values')) {
          const match = parsed.error.message.match(/supported values?[:\s]*\[([^\]]+)\]/i);
          if (match) {
            details.supportedValues = match[1].split(',').map((v: string) => v.trim().replace(/['"]/g, ''));
          }
        }
      }
    } catch {
      // Not JSON, keep raw response
    }
  }

  return details;
}

/**
 * Custom error class for generation failures
 */
export class GenerationError extends Error {
  public readonly code?: string;
  public readonly status?: number;
  public readonly details?: GenerationErrorDetails;
  public readonly timestamp: Date;

  constructor(message: string, details?: Partial<GenerationErrorDetails>) {
    super(message);
    this.name = 'GenerationError';
    this.code = details?.code;
    this.status = details?.status;
    this.details = { message, ...details };
    this.timestamp = new Date();
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      status: this.status,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * Calculate next retry time with exponential backoff
 */
export function calculateNextRetryTime(attempts: number): Date {
  // Exponential backoff: 1min, 5min, 30min, 2hr, 24hr
  const backoffMinutes = [1, 5, 30, 120, 1440][Math.min(attempts - 1, 4)];
  const nextRetry = new Date();
  nextRetry.setMinutes(nextRetry.getMinutes() + backoffMinutes);
  return nextRetry;
}
