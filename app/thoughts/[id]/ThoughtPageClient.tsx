'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useState } from 'react'
import { Article } from '@/lib/types'
import SocialShare from '@/components/SocialShare'
import ArticleModelAttribution from '@/components/ArticleModelAttribution'
import ArticleRating from '@/components/ArticleRating'

// Dynamic import for non-critical visual effects
const Spotlight = dynamic(() => import('@/components/Spotlight'), {
  ssr: false,
  loading: () => null
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://amirhjalali.com'

// Helper to add basePath to image URLs at render time
const getImageUrl = (url: string | undefined) => {
  if (!url) return undefined
  // For Coolify VPS deployment, no basePath needed (deployed at root domain)
  // For GitHub Pages, set NEXT_PUBLIC_BASE_PATH in environment
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
  return url.startsWith('/') ? `${basePath}${url}` : url
}

interface ThoughtPageClientProps {
  id: string
  initialArticle: Article | null
}

export default function ThoughtPageClient({ id, initialArticle }: ThoughtPageClientProps) {
  const [article] = useState<Article | null>(initialArticle)

  if (!article) {
    notFound()
    return null // Ensure we don't render anything else
  }



  if (!article) {
    notFound()
  }

  const isDraft = article?.status === 'draft'

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      {/* Background effects */}
      <div className="noise-overlay" />
      <Spotlight />

      {/* Draft Preview Banner */}
      {isDraft && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-white/20"
        >
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#050505]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-[#050505]">DRAFT PREVIEW</span>
              <span className="text-xs text-[#333333]">This article is not published yet</span>
            </div>
            <Link
              href="/drafts"
              className="text-xs text-[#050505] hover:text-black font-medium underline"
            >
              Back to Drafts
            </Link>
          </div>
        </motion.div>
      )}

      <div className={`relative z-10 px-6 max-w-5xl mx-auto ${isDraft ? 'pt-32 pb-20' : 'py-20'}`}>
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/thoughts"
            className="inline-flex items-center gap-2 text-[#888888] hover:text-[#EAEAEA] transition-colors font-mono text-xs uppercase tracking-widest"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Articles
          </Link>
        </motion.div>

        {/* Article Excerpt and Tags */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <p className="text-xl text-[#888888] mb-6 leading-relaxed font-light font-sans">
            {article.excerpt}
          </p>

          {/* Tags and Social Share */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest text-[#888888] hover:text-[#EAEAEA] hover:border-white/20 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
            <SocialShare
              url={`/thoughts/${id}`}
              title={article.title}
              description={article.excerpt}
            />
          </div>
        </motion.header>

        {/* Article Image */}
        {article.imageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12 -mx-6 lg:-mx-12"
          >
            <div className="relative h-96 md:h-[500px] lg:h-[600px] overflow-hidden rounded-2xl border border-white/10">
              <img
                src={getImageUrl(article.imageUrl)}
                alt={article.title}
                className="w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />

              {/* Image overlay with article title */}
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                <div className="max-w-4xl">
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-serif font-light mb-4 text-[#EAEAEA] leading-tight"
                  >
                    {article.title}
                  </motion.h1>

                  {/* Meta info overlay */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap items-center gap-4 text-[#EAEAEA]/80 font-mono text-xs uppercase tracking-widest"
                  >
                    <span>By {article.author}</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                    {article.aiGenerated && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20 backdrop-blur-sm">
                          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          <span className="text-[10px] font-medium text-white">AI Generated</span>
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Article Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="prose prose-invert prose-lg max-w-none"
        >
          <div
            className="article-content text-[#EAEAEA]/90"
            dangerouslySetInnerHTML={{
              __html: (() => {
                // Inline images need the basePath added at render time
                // For Coolify VPS deployment, no basePath needed (deployed at root domain)
                const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
                return article.content
                  .replace(/\n/g, '<br/>')
                  .replace(/## (.*)/g, '<h2>$1</h2>')
                  .replace(/### (.*)/g, '<h3>$1</h3>')
                  .replace(/# (.*)/g, '<h1>$1</h1>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/• \*\*(.*?)\*\*/g, '• <strong>$1</strong>')
                  .replace(/src="\/images\//g, `src="${basePath}/images/`)
              })()
            }}
          />
        </motion.article>

        {/* Article Footer */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-16 pt-8 border-t border-white/10"
        >
          {/* Rating */}
          {article.aiGenerated && (
            <div className="mb-6">
              <ArticleRating articleId={article.id} mode="thumbs" />
            </div>
          )}

          {/* Model Attribution (only for AI-generated articles) */}
          {article.aiGenerated && article.metadata && (
            <ArticleModelAttribution metadata={article.metadata} />
          )}
        </motion.footer>

      </div>

      <style jsx global>{`
        .article-content h1, 
        .article-content h2, 
        .article-content h3, 
        .article-content h4 {
          font-family: var(--font-cormorant), serif;
          color: #EAEAEA;
          font-weight: 300;
          letter-spacing: -0.02em;
        }
        
        .article-content h1 { font-size: 2.5rem; margin-top: 3rem; margin-bottom: 1.5rem; }
        .article-content h2 { font-size: 2rem; margin-top: 2.5rem; margin-bottom: 1.25rem; }
        .article-content h3 { font-size: 1.75rem; margin-top: 2rem; margin-bottom: 1rem; }
        
        .article-content p {
          font-family: 'Inter', sans-serif;
          font-size: 1.125rem;
          line-height: 1.8;
          margin-bottom: 1.5rem;
          color: rgba(234, 234, 234, 0.8);
          font-weight: 200;
        }

        .article-content ul, 
        .article-content ol {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
          color: rgba(234, 234, 234, 0.9);
          font-family: 'Inter', sans-serif;
          font-weight: 300;
        }
        
        .article-content li {
          margin: 0.75rem 0;
          line-height: 1.7;
        }

        .article-content strong {
          color: #FFFFFF;
          font-weight: 400;
        }

        .article-content blockquote {
          border-left: 2px solid rgba(255, 255, 255, 0.2);
          padding-left: 1.5rem;
          margin: 2rem 0;
          font-style: italic;
          color: rgba(234, 234, 234, 0.7);
        }

        .article-content code {
          font-family: var(--font-jetbrains), monospace;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.2em 0.4em;
          border-radius: 0.25rem;
          font-size: 0.9em;
          color: #EAEAEA;
        }

        .article-content pre {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          border-radius: 0.75rem;
          overflow-x: auto;
          margin: 2rem 0;
        }

        .article-content pre code {
          background: transparent;
          padding: 0;
          color: inherit;
          font-size: 0.9rem;
        }
      `}</style>
    </div>
  )
}
