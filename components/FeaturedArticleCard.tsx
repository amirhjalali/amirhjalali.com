'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import { ArrowUpRight } from 'lucide-react'
import type { Article } from '@/lib/types'

const getImageUrl = (url: string | undefined) => {
  if (!url) return undefined
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return url.startsWith('/') ? `${basePath}${url}` : url
}

interface FeaturedArticleCardProps {
  article: Article
}

export default function FeaturedArticleCard({ article }: FeaturedArticleCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="group"
    >
      <Link
        href={`/thoughts/${article.id}`}
        aria-label={`Read article: ${article.title}`}
        className="block"
      >
        <article className="relative grid md:grid-cols-2 gap-0 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.03)]">
          {/* Image Section */}
          {article.imageUrl && (
            <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
              <LazyImage
                src={getImageUrl(article.imageUrl) || ''}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                wrapperClassName="w-full h-full"
                aspectRatio="wide"
                placeholder="skeleton"
              />
              {/* Gradient overlay for text readability on mobile */}
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent md:from-transparent md:via-transparent md:to-[#050505]/60" />

              {article.aiGenerated && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-black/50 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest text-white backdrop-blur-sm">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  AI Generated
                </div>
              )}
            </div>
          )}

          {/* Content Section */}
          <div className="p-8 md:p-12 flex flex-col justify-center relative">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">
                  Featured Article
                </span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">
                  {article.readTime}
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-serif font-light mb-4 text-[#EAEAEA] group-hover:text-white transition-colors leading-tight">
                {article.title}
              </h2>

              <p className="text-[#888888] text-lg mb-6 leading-relaxed line-clamp-3">
                {article.excerpt}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-3 py-1.5 border border-white/10 rounded-full font-mono uppercase tracking-widest text-[#888888] group-hover:border-white/20 group-hover:text-[#EAEAEA] transition-all"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666]">
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <div className="flex items-center gap-2 text-[#888888] group-hover:text-white transition-colors">
                  <span className="text-sm font-mono uppercase tracking-widest">Read Article</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </motion.div>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}
