/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: '/amirhjalali.com',
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
