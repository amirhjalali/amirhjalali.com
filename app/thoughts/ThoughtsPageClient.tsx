'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import type { Article } from '@/lib/articles'

const getImageUrl = (url: string | undefined) => {
  if (!url) return undefined
  // For Coolify VPS deployment, no basePath needed (deployed at root domain)
  // For GitHub Pages, set NEXT_PUBLIC_BASE_PATH in environment
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return url.startsWith('/') ? `${basePath}${url}` : url
}

const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.18
    }
  }
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 }
}

interface ThoughtsPageClientProps {
  articles: Article[]
}

export default function ThoughtsPageClient({ articles }: ThoughtsPageClientProps) {
  const sortedArticles = useMemo(
    () =>
      [...articles].sort(
        (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      ),
    [articles]
  )

  return (
    <div className="min-h-screen relative">
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />

      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-space mb-6">
            <span className="text-gradient">Thoughts</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Insights on AI trends, programming paradigms, and the future of technology
          </p>
        </motion.div>

        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {sortedArticles.map((article) => (
            <motion.div
              key={article.id}
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.01 }}
              className="group relative"
            >
              <Link href={`/thoughts/${article.id}`} className="block h-full">
                <div className="relative glass border border-border rounded-3xl overflow-hidden hover:border-ai-teal/30 dark:hover:border-ai-green/30 transition-all duration-300 h-full flex flex-col">
                  <div className="absolute inset-0 bg-gradient-to-br from-ai-teal/5 via-transparent to-ai-cyan/5 dark:from-ai-green/5 dark:via-transparent dark:to-ai-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {article.imageUrl && (
                    <div className="relative h-48 overflow-hidden">
                      <LazyImage
                        src={getImageUrl(article.imageUrl) || ''}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        wrapperClassName="w-full h-full"
                        aspectRatio="wide"
                        placeholder="skeleton"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                      {article.aiGenerated && (
                        <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-ai-teal/90 dark:bg-ai-green/90 rounded-full text-xs font-medium text-white">
                          <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                          AI
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3 text-xs text-muted-foreground">
                      <span>{article.author}</span>
                      <span>{article.readTime}</span>
                    </div>

                    <h3 className="text-xl mb-3 group-hover:text-gradient transition-all duration-300 line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
                      {article.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-xs px-2 py-1 bg-accent hover:bg-accent/80 rounded-full transition-all"
                        >
                          {tag}
                        </span>
                      ))}
                      {article.tags.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-muted/20 rounded-full text-muted-foreground">
                          +{article.tags.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      <span className="text-ai-teal dark:text-ai-green opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                        Read more →
                      </span>
                    </div>
                  </div>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-r from-ai-teal/10 to-ai-cyan/10 dark:from-ai-green/10 dark:to-ai-blue/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
