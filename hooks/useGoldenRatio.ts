import { useEffect, useState } from 'react';

const PHI = 1.618;

export function useGoldenRatio() {
  const [baseFontSize, setBaseFontSize] = useState(16);

  useEffect(() => {
    const updateBaseFontSize = () => {
      // Calculate base font size based on viewport width
      // Using golden ratio to scale between min and max sizes
      const vw = window.innerWidth;
      const minSize = 14;
      const maxSize = 18;
      const minVw = 320;
      const maxVw = 1920;
      
      // Golden ratio scaling formula
      const scale = (vw - minVw) / (maxVw - minVw);
      const goldenScale = Math.pow(scale, 1 / PHI);
      const newSize = minSize + (maxSize - minSize) * goldenScale;
      
      setBaseFontSize(Math.round(newSize * 100) / 100);
    };

    updateBaseFontSize();
    window.addEventListener('resize', updateBaseFontSize);

    return () => window.removeEventListener('resize', updateBaseFontSize);
  }, []);

  return {
    baseFontSize,
    scale: {
      xs: baseFontSize / Math.pow(PHI, 2),
      sm: baseFontSize / PHI,
      base: baseFontSize,
      lg: baseFontSize * PHI,
      xl: baseFontSize * Math.pow(PHI, 2),
      '2xl': baseFontSize * Math.pow(PHI, 3),
      '3xl': baseFontSize * Math.pow(PHI, 4),
    },
    spacing: {
      xs: `${0.25 / Math.pow(PHI, 2)}rem`,
      sm: `${0.5 / PHI}rem`,
      base: '0.5rem',
      md: `${0.5 * PHI}rem`,
      lg: `${0.5 * Math.pow(PHI, 2)}rem`,
      xl: `${0.5 * Math.pow(PHI, 3)}rem`,
      '2xl': `${0.5 * Math.pow(PHI, 4)}rem`,
      '3xl': `${0.5 * Math.pow(PHI, 5)}rem`,
    },
  };
}

// Helper function to apply golden ratio to any value
export function applyGoldenRatio(value: number, steps: number = 1): number {
  return value * Math.pow(PHI, steps);
}

// Helper function to create golden ratio sequence
export function goldenSequence(base: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) => base * Math.pow(PHI, i - Math.floor(count / 2)));
}