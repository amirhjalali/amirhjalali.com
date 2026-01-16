'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import type { Article } from '@/lib/types'
import FeaturedArticleCard from '@/components/FeaturedArticleCard'
import { ArrowUpRight } from 'lucide-react'

// Dynamic import for non-critical visual effects
const Spotlight = dynamic(() => import('@/components/Spotlight'), {
  ssr: false,
  loading: () => null
})

const getImageUrl = (url: string | undefined) => {
  if (!url) return undefined
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return url.startsWith('/') ? `${basePath}${url}` : url
}

const gridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
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

  const [featuredArticle, ...otherArticles] = sortedArticles

  if (!featuredArticle) {
    return (
      <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
        <div className="noise-overlay" />
        <Spotlight />
        <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight mb-6">
            Thoughts
          </h1>
          <p className="text-[#888888]">No articles published yet.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />
      <Spotlight />

      <div className="relative z-10 section-padding container-padding max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-page-title mb-6">
            Thoughts
          </h1>
        </motion.div>

        {/* Featured Article - Full Width */}
        <div className="mb-12">
          <FeaturedArticleCard article={featuredArticle} />
        </div>

        {/* Other Articles Grid - 2 columns */}
        {otherArticles.length > 0 && (
          <motion.div
            variants={gridVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {otherArticles.map((article, index) => (
              <motion.div
                key={article.id}
                variants={cardVariants}
                transition={{ delay: index * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative h-full"
              >
                <Link href={`/thoughts/${article.id}`} className="block h-full">
                  <article className="relative border border-white/10 rounded-xl overflow-hidden bg-transparent hover:bg-white/[0.03] transition-[background,border-color,box-shadow] duration-500 h-full flex flex-col backdrop-blur-md hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">

                    {article.imageUrl && (
                      <div className="relative h-48 overflow-hidden border-b border-white/5">
                        <LazyImage
                          src={getImageUrl(article.imageUrl) || ''}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
                          wrapperClassName="w-full h-full"
                          aspectRatio="wide"
                          placeholder="skeleton"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 to-transparent" />

                        {article.aiGenerated && (
                          <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/50 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest text-white backdrop-blur-sm">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            AI
                          </div>
                        )}
                      </div>
                    )}

                    <motion.div
                      className="p-6 flex flex-col flex-grow"
                      initial={{ y: 0 }}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="flex justify-between items-start mb-3 text-[10px] font-mono uppercase tracking-widest text-[#666666]">
                        <span>{article.author}</span>
                        <span>{article.readTime}</span>
                      </div>

                      <h3 className="text-xl mb-3 font-serif font-light text-[#EAEAEA] group-hover:text-white transition-colors duration-300 line-clamp-2">
                        {article.title}
                      </h3>

                      <p className="text-[#888888] text-sm line-clamp-3 mb-4 flex-grow font-sans">
                        {article.excerpt}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] px-2 py-1 border border-white/10 rounded-full font-mono uppercase tracking-widest text-[#888888] group-hover:border-white/20 group-hover:text-[#EAEAEA] transition-[border-color,color]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-[#888888]">
                        <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                        <ArrowUpRight className="w-4 h-4 text-[#888888] group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-[color,transform] duration-300" />
                      </div>
                    </motion.div>
                  </article>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
