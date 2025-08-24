// Performance monitoring utilities

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