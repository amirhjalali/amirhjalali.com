// API utilities and error handling
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
  success: boolean;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// Enhanced fetch with timeout, retries, and error handling
export const apiClient = {
  async request<T = any>(
    url: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      timeout = 10000,
      retries = 3,
      retryDelay = 1000,
      ...fetchOptions
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
        });

        clearTimeout(timeoutId);

        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : await response.text();

        if (!response.ok) {
          return {
            data: undefined,
            error: data.message || `HTTP ${response.status}: ${response.statusText}`,
            status: response.status,
            success: false,
          };
        }

        return {
          data,
          status: response.status,
          success: true,
        };
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }
      }
    }

    return {
      error: lastError?.message || 'Request failed',
      status: 0,
      success: false,
    };
  },

  get<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return apiClient.request<T>(url, { ...options, method: 'GET' });
  },

  post<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return apiClient.request<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put<T = any>(url: string, data?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    return apiClient.request<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete<T = any>(url: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return apiClient.request<T>(url, { ...options, method: 'DELETE' });
  },
};

// Error boundary utility
export class ApiError extends Error {
  public status: number;
  public code?: string;

  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

// Request/Response interceptors
export const interceptors = {
  request: new Set<(config: RequestOptions) => RequestOptions>(),
  response: new Set<(response: ApiResponse) => ApiResponse>(),

  addRequestInterceptor: (interceptor: (config: RequestOptions) => RequestOptions) => {
    interceptors.request.add(interceptor);
  },

  addResponseInterceptor: (interceptor: (response: ApiResponse) => ApiResponse) => {
    interceptors.response.add(interceptor);
  },

  removeRequestInterceptor: (interceptor: (config: RequestOptions) => RequestOptions) => {
    interceptors.request.delete(interceptor);
  },

  removeResponseInterceptor: (interceptor: (response: ApiResponse) => ApiResponse) => {
    interceptors.response.delete(interceptor);
  },
};

// Cache manager for API responses
export const apiCache = {
  cache: new Map<string, { data: any; timestamp: number; ttl: number }>(),

  set: (key: string, data: any, ttl: number = 300000) => { // 5 minutes default
    apiCache.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  },

  get: (key: string) => {
    const item = apiCache.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      apiCache.cache.delete(key);
      return null;
    }

    return item.data;
  },

  invalidate: (key: string) => {
    apiCache.cache.delete(key);
  },

  clear: () => {
    apiCache.cache.clear();
  },

  generateKey: (url: string, options?: RequestOptions): string => {
    return `${options?.method || 'GET'}:${url}:${JSON.stringify(options?.body || {})}`;
  },
};

// Loading state manager
export const loadingManager = {
  loadingStates: new Map<string, boolean>(),

  setLoading: (key: string, loading: boolean) => {
    loadingManager.loadingStates.set(key, loading);
  },

  isLoading: (key: string): boolean => {
    return loadingManager.loadingStates.get(key) || false;
  },

  withLoading: async <T>(key: string, fn: () => Promise<T>): Promise<T> => {
    loadingManager.setLoading(key, true);
    try {
      return await fn();
    } finally {
      loadingManager.setLoading(key, false);
    }
  },
};

// Rate limiter for API calls
export const rateLimiter = {
  requests: new Map<string, number[]>(),

  isAllowed: (key: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
    const now = Date.now();
    const requests = rateLimiter.requests.get(key) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    rateLimiter.requests.set(key, validRequests);
    return true;
  },

  reset: (key: string) => {
    rateLimiter.requests.delete(key);
  },
};