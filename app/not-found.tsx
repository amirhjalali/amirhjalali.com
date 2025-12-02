'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen relative flex items-center justify-center">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient opacity-20" />

      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          <h1 className="text-9xl font-space font-black mb-4">
            <span className="text-gradient">404</span>
          </h1>

          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Page Not Found
          </h2>

          <p className="text-xl text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="px-8 py-4 bg-gradient-to-r from-ai-teal to-ai-cyan dark:from-ai-green dark:to-ai-blue text-white font-semibold rounded-xl hover:scale-105 transition-transform"
            >
              Go Home
            </Link>
            <Link
              href="/thoughts"
              className="px-8 py-4 glass border border-border rounded-xl hover:border-ai-teal/50 dark:hover:border-ai-green/50 transition-all"
            >
              View Articles
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
