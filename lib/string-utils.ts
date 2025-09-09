// String manipulation and text processing utilities
export const stringUtils = {
  // Convert to different cases
  toCamelCase: (str: string): string => {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
      .replace(/^./, char => char.toLowerCase());
  },

  toKebabCase: (str: string): string => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  },

  toSnakeCase: (str: string): string => {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  },

  toPascalCase: (str: string): string => {
    return str
      .replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '')
      .replace(/^./, char => char.toUpperCase());
  },

  toTitleCase: (str: string): string => {
    return str.replace(/\b\w+/g, word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
  },

  // Truncate string
  truncate: (str: string, maxLength: number, suffix: string = '...'): string => {
    if (str.length <= maxLength) return str;
    return str.slice(0, maxLength - suffix.length) + suffix;
  },

  // Truncate words
  truncateWords: (str: string, maxWords: number, suffix: string = '...'): string => {
    const words = str.split(/\s+/);
    if (words.length <= maxWords) return str;
    return words.slice(0, maxWords).join(' ') + suffix;
  },

  // Slugify for URLs
  slugify: (str: string): string => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  },

  // Strip HTML tags
  stripHtml: (str: string): string => {
    return str.replace(/<[^>]*>/g, '');
  },

  // Escape regex special characters
  escapeRegex: (str: string): string => {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  // Highlight text
  highlight: (text: string, search: string, className: string = 'highlight'): string => {
    if (!search) return text;
    const regex = new RegExp(`(${stringUtils.escapeRegex(search)})`, 'gi');
    return text.replace(regex, `<mark class="${className}">$1</mark>`);
  },

  // Word count
  wordCount: (str: string): number => {
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
  },

  // Character count
  charCount: (str: string, includeSpaces: boolean = true): number => {
    return includeSpaces ? str.length : str.replace(/\s/g, '').length;
  },

  // Reading time estimation
  readingTime: (text: string, wordsPerMinute: number = 200): number => {
    const words = stringUtils.wordCount(text);
    return Math.ceil(words / wordsPerMinute);
  },

  // Extract initials
  getInitials: (name: string, maxInitials: number = 2): string => {
    return name
      .split(/\s+/)
      .map(word => word[0])
      .filter(Boolean)
      .slice(0, maxInitials)
      .join('')
      .toUpperCase();
  },

  // Parse query string
  parseQueryString: (query: string): Record<string, string> => {
    const params: Record<string, string> = {};
    const searchParams = new URLSearchParams(query);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  },

  // Build query string
  buildQueryString: (params: Record<string, string | number | boolean>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    return searchParams.toString();
  },

  // Mask sensitive data
  mask: (str: string, start: number = 0, end?: number, maskChar: string = '*'): string => {
    const length = str.length;
    const endIndex = end ?? length - 4;
    
    if (start >= length || endIndex <= start) return str;
    
    return str.slice(0, start) + 
           maskChar.repeat(Math.min(endIndex - start, length - start)) + 
           str.slice(endIndex);
  },

  // Check if string is palindrome
  isPalindrome: (str: string): boolean => {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === cleaned.split('').reverse().join('');
  },

  // Generate random string
  random: (length: number, chars: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
};