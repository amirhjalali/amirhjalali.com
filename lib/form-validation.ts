// Form validation utilities
export interface ValidationRule {
  test: (value: any) => boolean;
  message: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule[];
}

export const validators = {
  required: (message = 'This field is required'): ValidationRule => ({
    test: (value) => value !== undefined && value !== null && value !== '',
    message,
  }),

  email: (message = 'Invalid email address'): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => typeof value === 'string' && value.length >= min,
    message: message || `Must be at least ${min} characters`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => typeof value === 'string' && value.length <= max,
    message: message || `Must be no more than ${max} characters`,
  }),

  pattern: (regex: RegExp, message = 'Invalid format'): ValidationRule => ({
    test: (value) => regex.test(value),
    message,
  }),

  number: (message = 'Must be a number'): ValidationRule => ({
    test: (value) => !isNaN(Number(value)),
    message,
  }),

  min: (min: number, message?: string): ValidationRule => ({
    test: (value) => Number(value) >= min,
    message: message || `Must be at least ${min}`,
  }),

  max: (max: number, message?: string): ValidationRule => ({
    test: (value) => Number(value) <= max,
    message: message || `Must be no more than ${max}`,
  }),

  url: (message = 'Invalid URL'): ValidationRule => ({
    test: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  phone: (message = 'Invalid phone number'): ValidationRule => ({
    test: (value) => /^[\d\s\-\+\(\)]+$/.test(value) && value.replace(/\D/g, '').length >= 10,
    message,
  }),

  password: (message = 'Password must contain at least 8 characters, one uppercase, one lowercase, and one number'): ValidationRule => ({
    test: (value) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/.test(value),
    message,
  }),

  confirmPassword: (passwordField: string, message = 'Passwords do not match'): ValidationRule => ({
    test: (value, formData) => value === formData?.[passwordField],
    message,
  }),

  date: (message = 'Invalid date'): ValidationRule => ({
    test: (value) => !isNaN(Date.parse(value)),
    message,
  }),

  futureDate: (message = 'Date must be in the future'): ValidationRule => ({
    test: (value) => new Date(value) > new Date(),
    message,
  }),

  pastDate: (message = 'Date must be in the past'): ValidationRule => ({
    test: (value) => new Date(value) < new Date(),
    message,
  }),

  fileSize: (maxSizeInBytes: number, message?: string): ValidationRule => ({
    test: (value) => value instanceof File && value.size <= maxSizeInBytes,
    message: message || `File size must be less than ${maxSizeInBytes / 1024 / 1024}MB`,
  }),

  fileType: (allowedTypes: string[], message?: string): ValidationRule => ({
    test: (value) => value instanceof File && allowedTypes.includes(value.type),
    message: message || `File type must be one of: ${allowedTypes.join(', ')}`,
  }),
};

// Validate form data
export const validateForm = (
  data: Record<string, any>,
  schema: ValidationSchema
): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  Object.entries(schema).forEach(([field, rules]) => {
    const fieldErrors: string[] = [];
    const value = data[field];

    rules.forEach((rule) => {
      if (!rule.test(value, data)) {
        fieldErrors.push(rule.message);
      }
    });

    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
    }
  });

  return errors;
};

// Check if form has errors
export const hasErrors = (errors: Record<string, string[]>): boolean => {
  return Object.keys(errors).length > 0;
};

// Get first error for a field
export const getFieldError = (errors: Record<string, string[]>, field: string): string | null => {
  return errors[field]?.[0] || null;
};