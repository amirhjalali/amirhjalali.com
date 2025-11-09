/** @type {import('next').NextConfig} */
const nextConfig = {
  // VPS Deployment with Coolify
  // Full Next.js features enabled including API routes

  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
