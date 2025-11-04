'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  getArticleById,
  getDraftArticleById,
  initializeDefaultArticles,
  initializeDrafts,
  type Article
} from '@/lib/articles'
import ThoughtPageClient from './thoughts/[id]/ThoughtPageClient'

export default function NotFound() {
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [article, setArticle] = useState<Article | null>(null)

  useEffect(() => {
    const checkForArticle = async () => {
      // Check if this is a thoughts route
      const match = pathname?.match(/\/thoughts\/([^\/]+)/)
      if (match) {
        const id = match[1]

        // Initialize articles
        initializeDefaultArticles()
        await initializeDrafts()

        // Check if article exists in localStorage
        const found = getArticleById(id) || getDraftArticleById(id)

        if (found) {
          setArticle(found)
          setChecking(false)
          return
        }
      }

      setChecking(false)
    }

    checkForArticle()
  }, [pathname])

  // If we found an article, render it
  if (article) {
    return <ThoughtPageClient id={article.id} initialArticle={article} />
  }

  // If still checking, show loading
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-ai-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  // Otherwise show 404
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
