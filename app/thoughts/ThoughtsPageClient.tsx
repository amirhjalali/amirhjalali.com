'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import type { Article } from '@/lib/articles'
import Spotlight from '@/components/Spotlight'

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
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <Spotlight />

      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight mb-6 text-[#EAEAEA]">
            Thoughts
          </h1>
          <p className="text-xl font-mono text-[#888888] max-w-3xl mx-auto">
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
              whileHover={{ y: -4 }}
              className="group relative"
            >
              <Link href={`/thoughts/${article.id}`} className="block h-full">
                <div className="relative border border-white/10 rounded-xl overflow-hidden bg-transparent hover:bg-white/5 transition-all duration-500 h-full flex flex-col backdrop-blur-md">

                  {article.imageUrl && (
                    <div className="relative h-48 overflow-hidden border-b border-white/5">
                      <LazyImage
                        src={getImageUrl(article.imageUrl) || ''}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                        wrapperClassName="w-full h-full"
                        aspectRatio="wide"
                        placeholder="skeleton"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

                      {article.aiGenerated && (
                        <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/50 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest text-white backdrop-blur-sm">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          AI
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-3 text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                      <span>{article.author}</span>
                      <span>{article.readTime}</span>
                    </div>

                    <h3 className="text-xl mb-3 font-serif font-light text-[#EAEAEA] group-hover:text-white transition-colors duration-300 line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-[#888888] text-sm line-clamp-3 mb-4 flex-grow font-sans font-light">
                      {article.excerpt}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] px-2 py-1 border border-white/10 rounded-full font-mono uppercase tracking-widest text-[#888888] group-hover:border-white/20 group-hover:text-[#EAEAEA] transition-all"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                      <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                      <span className="text-[#EAEAEA] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Read more →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

