// Testing utilities and component helpers
export const testUtils = {
  // Generate test data
  generateUser: (overrides: Partial<any> = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  generateProject: (overrides: Partial<any> = {}) => ({
    id: Math.random().toString(36).substr(2, 9),
    title: 'Test Project',
    description: 'A test project description',
    technologies: ['React', 'TypeScript'],
    githubUrl: 'https://github.com/test/project',
    liveUrl: 'https://test-project.com',
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  // Mock functions
  createMockFunction: <T extends (...args: any[]) => any>(
    implementation?: T
  ): T & { calls: Parameters<T>[]; results: ReturnType<T>[] } => {
    const calls: Parameters<T>[] = [];
    const results: ReturnType<T>[] = [];

    const mockFn = ((...args: Parameters<T>) => {
      calls.push(args);
      const result = implementation ? implementation(...args) : undefined;
      results.push(result);
      return result;
    }) as T & { calls: Parameters<T>[]; results: ReturnType<T>[] };

    mockFn.calls = calls;
    mockFn.results = results;

    return mockFn;
  },

  // Wait for condition
  waitFor: async (condition: () => boolean, timeout: number = 5000): Promise<void> => {
    const startTime = Date.now();
    
    while (!condition()) {
      if (Date.now() - startTime > timeout) {
        throw new Error(`Timeout waiting for condition after ${timeout}ms`);
      }
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  },

  // Simulate user events
  simulateClick: (element: HTMLElement) => {
    element.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    }));
  },

  simulateInput: (element: HTMLInputElement, value: string) => {
    element.value = value;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  },

  simulateKeyPress: (element: HTMLElement, key: string) => {
    element.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }));
  },
};

// Component testing helpers
export const componentHelpers = {
  // Find elements by test ID
  getByTestId: (testId: string): HTMLElement | null => {
    return document.querySelector(`[data-testid="${testId}"]`);
  },

  getAllByTestId: (testId: string): NodeListOf<HTMLElement> => {
    return document.querySelectorAll(`[data-testid="${testId}"]`);
  },

  // Assert element properties
  assertElementExists: (selector: string) => {
    const element = document.querySelector(selector);
    if (!element) {
      throw new Error(`Element with selector "${selector}" not found`);
    }
    return element as HTMLElement;
  },

  assertElementHasText: (element: HTMLElement, expectedText: string) => {
    const actualText = element.textContent?.trim();
    if (actualText !== expectedText) {
      throw new Error(`Expected text "${expectedText}", but got "${actualText}"`);
    }
  },

  assertElementHasClass: (element: HTMLElement, className: string) => {
    if (!element.classList.contains(className)) {
      throw new Error(`Element does not have class "${className}"`);
    }
  },

  // Accessibility testing helpers
  checkAccessibility: (element: HTMLElement = document.body) => {
    const issues: string[] = [];

    // Check for missing alt text
    const images = element.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push(`Image at index ${index} is missing alt text`);
      }
    });

    // Check for missing form labels
    const inputs = element.querySelectorAll('input, select, textarea');
    inputs.forEach((input, index) => {
      const id = input.id;
      if (id) {
        const label = element.querySelector(`label[for="${id}"]`);
        if (!label && !input.getAttribute('aria-label')) {
          issues.push(`Input at index ${index} is missing a label`);
        }
      }
    });

    // Check for heading hierarchy
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1]);
      if (level - lastLevel > 1) {
        issues.push(`Heading hierarchy broken at index ${index}: ${heading.tagName}`);
      }
      lastLevel = level;
    });

    return issues;
  },
};

// Performance testing utilities
export const performanceHelpers = {
  measureRenderTime: async (renderFn: () => void): Promise<number> => {
    const start = performance.now();
    renderFn();
    
    // Wait for next frame
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    return performance.now() - start;
  },

  measureMemoryUsage: (): number | null => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return null;
  },

  checkForMemoryLeaks: async (testFn: () => void, iterations: number = 10): Promise<boolean> => {
    const initialMemory = performanceHelpers.measureMemoryUsage();
    
    if (initialMemory === null) {
      console.warn('Memory measurement not available');
      return false;
    }

    for (let i = 0; i < iterations; i++) {
      testFn();
      // Force garbage collection if available
      if ('gc' in window) {
        (window as any).gc();
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const finalMemory = performanceHelpers.measureMemoryUsage();
    if (finalMemory === null) return false;

    const memoryIncrease = finalMemory - initialMemory;
    const threshold = 1024 * 1024; // 1MB threshold

    return memoryIncrease > threshold;
  },
};

// Mock API responses
export const mockApi = {
  createMockResponse: <T>(data: T, delay: number = 0): Promise<T> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(data), delay);
    });
  },

  createMockError: (message: string, delay: number = 0): Promise<never> => {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), delay);
    });
  },

  mockFetch: (responses: Map<string, any>) => {
    const originalFetch = global.fetch;

    global.fetch = ((url: string) => {
      const response = responses.get(url);
      if (response) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(response),
        } as Response);
      }
      return Promise.reject(new Error(`No mock response for ${url}`));
    }) as typeof global.fetch;

    return () => {
      global.fetch = originalFetch;
    };
  },
};