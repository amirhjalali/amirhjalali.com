/** @type {import('next').NextConfig} */
const nextConfig = {
  // DEPLOYMENT CHOICE:
  //
  // GitHub Pages (current): Static export, no API routes, button won't work
  output: 'export',
  basePath: '/amirhjalali.com',
  //
  // Vercel (recommended): Server-side API routes, button works securely
  // To switch to Vercel: comment out the two lines above and deploy to Vercel
  // basePath: '',

  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
