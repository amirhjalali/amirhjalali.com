/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to enable API routes (keeps key secure server-side)
  // For GitHub Pages deployment, uncomment the line below:
  // output: 'export',
  basePath: process.env.NODE_ENV === 'production' && process.env.VERCEL !== '1' ? '/amirhjalali.com' : '',
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
