// Development utilities and debugging helpers
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Enhanced console logging with timestamps and colors
export const logger = {
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`%c[INFO ${new Date().toISOString()}]`, 'color: #3b82f6', message, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(`%c[WARN ${new Date().toISOString()}]`, 'color: #f59e0b', message, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    console.error(`%c[ERROR ${new Date().toISOString()}]`, 'color: #ef4444', message, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(`%c[DEBUG ${new Date().toISOString()}]`, 'color: #8b5cf6', message, ...args);
    }
  },
  
  success: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(`%c[SUCCESS ${new Date().toISOString()}]`, 'color: #10b981', message, ...args);
    }
  },
};

// Performance timing utilities
export const performanceTimer = {
  timers: new Map<string, number>(),
  
  start: (label: string) => {
    if (isDevelopment) {
      performanceTimer.timers.set(label, performance.now());
      logger.debug(`Timer started: ${label}`);
    }
  },
  
  end: (label: string) => {
    if (isDevelopment) {
      const startTime = performanceTimer.timers.get(label);
      if (startTime) {
        const duration = performance.now() - startTime;
        logger.info(`Timer ${label}: ${duration.toFixed(2)}ms`);
        performanceTimer.timers.delete(label);
        return duration;
      } else {
        logger.warn(`Timer ${label} was not started`);
      }
    }
    return 0;
  },
  
  measure: <T>(label: string, fn: () => T): T => {
    performanceTimer.start(label);
    const result = fn();
    performanceTimer.end(label);
    return result;
  },
};

// Component render tracking
export const renderTracker = {
  renders: new Map<string, number>(),
  
  track: (componentName: string) => {
    if (isDevelopment) {
      const current = renderTracker.renders.get(componentName) || 0;
      renderTracker.renders.set(componentName, current + 1);
      logger.debug(`${componentName} rendered ${current + 1} times`);
    }
  },
  
  getStats: () => {
    return Object.fromEntries(renderTracker.renders);
  },
  
  reset: () => {
    renderTracker.renders.clear();
  },
};

// Memory usage monitoring
export const memoryMonitor = {
  getUsage: () => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
      };
    }
    return null;
  },
  
  logUsage: () => {
    const usage = memoryMonitor.getUsage();
    if (usage && isDevelopment) {
      logger.info('Memory usage:', {
        used: `${(usage.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        total: `${(usage.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
        limit: `${(usage.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`,
        percentage: `${usage.usagePercentage.toFixed(2)}%`,
      });
    }
  },
};

// Development-only assertions
export const assert = (condition: any, message: string) => {
  if (isDevelopment && !condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
};

// Environment variable validator
export const validateEnvVars = (requiredVars: string[]) => {
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    logger.error(`Missing required environment variables: ${missing.join(', ')}`);
    if (isProduction) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
  
  return missing.length === 0;
};

// Feature flag system
export const featureFlags = {
  flags: new Map<string, boolean>(),
  
  set: (flag: string, enabled: boolean) => {
    featureFlags.flags.set(flag, enabled);
    logger.debug(`Feature flag ${flag} set to ${enabled}`);
  },
  
  get: (flag: string, defaultValue: boolean = false): boolean => {
    return featureFlags.flags.get(flag) ?? defaultValue;
  },
  
  isEnabled: (flag: string): boolean => {
    return featureFlags.get(flag, false);
  },
  
  toggle: (flag: string) => {
    const current = featureFlags.get(flag, false);
    featureFlags.set(flag, !current);
  },
};

// Bundle analyzer helper
export const bundleAnalyzer = {
  logChunkSizes: () => {
    if (isDevelopment && typeof window !== 'undefined') {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"]'));
      
      logger.info('JavaScript chunks:', scripts.map(s => (s as HTMLScriptElement).src));
      logger.info('CSS chunks:', styles.map(s => (s as HTMLLinkElement).href));
    }
  },
};