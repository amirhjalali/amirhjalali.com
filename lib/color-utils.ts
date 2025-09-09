// Color manipulation and conversion utilities
export const colorUtils = {
  // Convert hex to RGB
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  },

  // Convert RGB to hex
  rgbToHex: (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },

  // Convert RGB to HSL
  rgbToHsl: (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        case b:
          h = ((r - g) / d + 4) / 6;
          break;
      }
    }
    
    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  },

  // Convert HSL to RGB
  hslToRgb: (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255),
    };
  },

  // Lighten color
  lighten: (color: string, amount: number = 10): string => {
    const rgb = colorUtils.hexToRgb(color);
    if (!rgb) return color;
    
    const hsl = colorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.min(100, hsl.l + amount);
    
    const newRgb = colorUtils.hslToRgb(hsl.h, hsl.s, hsl.l);
    return colorUtils.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  },

  // Darken color
  darken: (color: string, amount: number = 10): string => {
    const rgb = colorUtils.hexToRgb(color);
    if (!rgb) return color;
    
    const hsl = colorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.l = Math.max(0, hsl.l - amount);
    
    const newRgb = colorUtils.hslToRgb(hsl.h, hsl.s, hsl.l);
    return colorUtils.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  },

  // Get contrast ratio
  getContrastRatio: (color1: string, color2: string): number => {
    const getLuminance = (r: number, g: number, b: number) => {
      const [rs, gs, bs] = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
    };
    
    const rgb1 = colorUtils.hexToRgb(color1);
    const rgb2 = colorUtils.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  },

  // Check if color passes WCAG AA
  isAccessible: (foreground: string, background: string, large: boolean = false): boolean => {
    const ratio = colorUtils.getContrastRatio(foreground, background);
    return large ? ratio >= 3 : ratio >= 4.5;
  },

  // Generate complementary color
  getComplementary: (color: string): string => {
    const rgb = colorUtils.hexToRgb(color);
    if (!rgb) return color;
    
    const hsl = colorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    hsl.h = (hsl.h + 180) % 360;
    
    const newRgb = colorUtils.hslToRgb(hsl.h, hsl.s, hsl.l);
    return colorUtils.rgbToHex(newRgb.r, newRgb.g, newRgb.b);
  },

  // Generate triadic colors
  getTriadic: (color: string): string[] => {
    const rgb = colorUtils.hexToRgb(color);
    if (!rgb) return [color];
    
    const hsl = colorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const colors: string[] = [];
    
    for (let i = 0; i < 3; i++) {
      const h = (hsl.h + (i * 120)) % 360;
      const newRgb = colorUtils.hslToRgb(h, hsl.s, hsl.l);
      colors.push(colorUtils.rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }
    
    return colors;
  },

  // Generate color palette
  generatePalette: (baseColor: string, count: number = 5): string[] => {
    const rgb = colorUtils.hexToRgb(baseColor);
    if (!rgb) return [baseColor];
    
    const hsl = colorUtils.rgbToHsl(rgb.r, rgb.g, rgb.b);
    const palette: string[] = [];
    
    const step = 60 / count;
    
    for (let i = 0; i < count; i++) {
      const l = 20 + (i * step);
      const newRgb = colorUtils.hslToRgb(hsl.h, hsl.s, l);
      palette.push(colorUtils.rgbToHex(newRgb.r, newRgb.g, newRgb.b));
    }
    
    return palette;
  },

  // Mix two colors
  mix: (color1: string, color2: string, weight: number = 0.5): string => {
    const rgb1 = colorUtils.hexToRgb(color1);
    const rgb2 = colorUtils.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return color1;
    
    const r = Math.round(rgb1.r * (1 - weight) + rgb2.r * weight);
    const g = Math.round(rgb1.g * (1 - weight) + rgb2.g * weight);
    const b = Math.round(rgb1.b * (1 - weight) + rgb2.b * weight);
    
    return colorUtils.rgbToHex(r, g, b);
  },

  // Random color generator
  random: (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  },
};