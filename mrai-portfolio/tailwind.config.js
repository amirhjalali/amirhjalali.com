/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'ai-green': '#00FF88',
        'ai-blue': '#00D9FF',
        'dark-bg': '#0A0A0A',
        'dark-surface': '#1A1A1A',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
        'space': ['Space Grotesk', 'sans-serif'],
      },
      animation: {
        'text-morph': 'morph 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}