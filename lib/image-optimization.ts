// Image optimization and loading utilities
export interface ImageOptimizationOptions {
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png';
  width?: number;
  height?: number;
  lazy?: boolean;
  blur?: boolean;
}

// Generate optimized image URLs for Next.js
export const getOptimizedImageUrl = (
  src: string,
  options: ImageOptimizationOptions = {}
): string => {
  const {
    quality = 75,
    format,
    width,
    height,
    lazy = true,
  } = options;

  const params = new URLSearchParams();
  
  if (quality) params.append('q', quality.toString());
  if (format) params.append('f', format);
  if (width) params.append('w', width.toString());
  if (height) params.append('h', height.toString());

  const queryString = params.toString();
  return queryString ? `${src}?${queryString}` : src;
};

// Create responsive image sizes
export const generateResponsiveSizes = (
  baseWidth: number,
  breakpoints: number[] = [640, 768, 1024, 1280, 1536]
): string => {
  return breakpoints
    .map(breakpoint => `(max-width: ${breakpoint}px) ${Math.min(baseWidth, breakpoint)}px`)
    .join(', ') + `, ${baseWidth}px`;
};

// Lazy loading intersection observer
export const createImageLazyLoader = (
  selector: string = 'img[data-src]',
  options: IntersectionObserverInit = {}
) => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        const src = img.dataset.src;
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      }
    });
  }, defaultOptions);

  const images = document.querySelectorAll(selector);
  images.forEach((img) => observer.observe(img));

  return observer;
};

// Preload critical images
export const preloadCriticalImages = (imageSrcs: string[]) => {
  imageSrcs.forEach((src) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = src;
    document.head.appendChild(link);
  });
};

// Image format detection and fallback
export const getBestImageFormat = (): 'avif' | 'webp' | 'jpeg' => {
  if (typeof window === 'undefined') return 'jpeg';

  // Check for AVIF support
  const avif = new Image();
  avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  
  return new Promise<'avif' | 'webp' | 'jpeg'>((resolve) => {
    avif.onload = () => resolve('avif');
    avif.onerror = () => {
      // Check for WebP support
      const webp = new Image();
      webp.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
      webp.onload = () => resolve('webp');
      webp.onerror = () => resolve('jpeg');
    };
  }).catch(() => 'jpeg') as any;
};

// Calculate image aspect ratio
export const getImageAspectRatio = (width: number, height: number): string => {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(width, height);
  return `${width / divisor}/${height / divisor}`;
};

// Generate placeholder blur data URL
export const generateBlurDataURL = (width: number, height: number): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  canvas.width = width;
  canvas.height = height;
  
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#f3f4f6');
    gradient.addColorStop(1, '#e5e7eb');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }
  
  return canvas.toDataURL();
};