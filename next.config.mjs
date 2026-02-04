import crypto from 'crypto';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // VPS Deployment with Coolify
  // Full Next.js features enabled including API routes

  poweredByHeader: false,
  reactStrictMode: true,

  // Allow build to proceed with eslint warnings
  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year for immutable images
  },

  // Generate unique build ID to force cache invalidation on new deployments
  // This prevents "Failed to find Server Action" errors from stale cached JS
  generateBuildId: async () => {
    // Use timestamp + random string for unique build ID
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString('hex');
    return `${timestamp}-${random}`;
  },

  // Headers for cache control
  async headers() {
    return [
      {
        // Force revalidation for HTML pages to get latest server actions
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Static assets can be cached longer (they have hash in filename)
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
