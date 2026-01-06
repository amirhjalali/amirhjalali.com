// Performance monitoring utilities

/**
 * ========================================
 * DESIGN SYSTEM v2.0 - Device Performance Detection
 * ========================================
 */

export type PerformanceTier = 'high' | 'medium' | 'low'

/**
 * Detects device performance tier based on:
 * - User's reduced motion preference
 * - Hardware concurrency (CPU cores)
 * - Device memory (if available)
 */
export function getDevicePerformance(): PerformanceTier {
  if (typeof window === 'undefined') return 'medium'

  // Check for reduced motion preference first
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return 'low'
  }

  // Check hardware concurrency (CPU cores)
  const cores = navigator.hardwareConcurrency || 4
  if (cores <= 2) return 'low'
  if (cores <= 4) return 'medium'

  // Check device memory if available (Chrome only)
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory
  if (memory !== undefined) {
    if (memory < 4) return 'low'
    if (memory < 8) return 'medium'
  }

  return 'high'
}

/**
 * Determines if complex animations should be used.
 * Returns false for low-performance devices.
 */
export function shouldUseComplexAnimations(): boolean {
  return getDevicePerformance() !== 'low'
}

/**
 * Determines if the custom cursor should be rendered.
 * Only show on high-performance desktop devices.
 */
export function shouldShowCustomCursor(): boolean {
  if (typeof window === 'undefined') return false

  // Check if touch device
  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches

  // Only show on non-touch, high-performance devices
  return !isTouchDevice && shouldUseComplexAnimations()
}

/**
 * Gets appropriate animation duration multiplier based on device performance.
 * Lower-end devices get faster (shorter) animations.
 */
export function getAnimationDurationMultiplier(): number {
  const performance = getDevicePerformance()
  switch (performance) {
    case 'low':
      return 0.5 // Faster animations
    case 'medium':
      return 0.8
    case 'high':
    default:
      return 1.0
  }
}

/**
 * Hook-friendly utility to check reduced motion preference.
 * Use this in components that need to conditionally animate.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * ========================================
 * Legacy Performance Monitoring Utilities
 * ========================================
 */

export const measurePerformance = () => {
  if (typeof window !== 'undefined' && window.performance) {
    // Get Core Web Vitals
    const paintEntries = performance.getEntriesByType('paint');
    const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    
    const metrics = {
      // First Contentful Paint
      fcp: fcpEntry ? Math.round(fcpEntry.startTime) : null,
      // Time to Interactive (approximation)
      tti: performance.timing.domInteractive - performance.timing.navigationStart,
      // DOM Content Loaded
      dcl: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart,
      // Page Load Complete
      load: performance.timing.loadEventEnd - performance.timing.navigationStart,
    };

    return metrics;
  }
  return null;
};

// Report Web Vitals to analytics
export const reportWebVitals = (metric: any) => {
  if (metric.label === 'web-vital') {
    // Send to analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        value: Math.round(metric.value),
        metric_id: metric.id,
        metric_value: metric.value,
        metric_delta: metric.delta,
      });
    }
  }
};

// Lazy load images with Intersection Observer
export const lazyLoadImages = () => {
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-lazy]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.lazy || '';
          img.classList.add('loaded');
          imageObserver.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px',
    });

    images.forEach(img => imageObserver.observe(img));
  }
};

// Preload critical resources
export const preloadCriticalAssets = (assets: string[]) => {
  assets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = asset;
    
    if (asset.endsWith('.css')) {
      link.as = 'style';
    } else if (asset.endsWith('.js')) {
      link.as = 'script';
    } else if (asset.match(/\.(jpg|jpeg|png|webp|avif)$/)) {
      link.as = 'image';
    }
    
    document.head.appendChild(link);
  });
};