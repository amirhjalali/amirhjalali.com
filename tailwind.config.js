/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "rgba(255, 255, 255, 0.08)",
        input: "rgba(255, 255, 255, 0.05)",
        ring: "rgba(255, 255, 255, 0.1)",
        background: "#050505",
        foreground: "#EAEAEA",
        primary: {
          DEFAULT: "#EAEAEA",
          foreground: "#050505",
        },
        secondary: {
          DEFAULT: "rgba(255, 255, 255, 0.03)",
          foreground: "#EAEAEA",
        },
        muted: {
          DEFAULT: "#888888",
          foreground: "#EAEAEA",
        },
        accent: {
          DEFAULT: "rgba(255, 255, 255, 0.05)",
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "rgba(255, 255, 255, 0.03)",
          foreground: "#EAEAEA",
        },
        'ai-green': '#00FF88',
        'ai-blue': '#00D9FF',
        'ai-yellow': '#FFD700',
        'ai-amber': '#FFB800',
        'ai-teal': '#0D9488',
        'ai-cyan': '#0891B2',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        serif: ['var(--font-cormorant)', 'serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'text-morph': 'morph 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s linear infinite',
      },
      keyframes: {
        'gradient-shift': {
          to: {
            'background-position': '200% center',
          },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}