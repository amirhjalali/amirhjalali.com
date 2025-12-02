'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useState } from 'react'
import { Article } from '@/lib/types'
import SocialShare from '@/components/SocialShare'
import Spotlight from '@/components/Spotlight'

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
          className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/90 backdrop-blur-sm border-b border-yellow-600"
        >
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-semibold text-yellow-900">DRAFT PREVIEW</span>
              <span className="text-xs text-yellow-800">This article is not published yet</span>
            </div>
            <Link
              href="/admin"
              className="text-xs text-yellow-900 hover:text-yellow-950 font-medium underline"
            >
              Back to Admin
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
          transition={{ delay: 0.4 }}
          className="mt-16 pt-8 border-t border-white/10"
        >
          <div className="text-center">
            <h3 className="text-xl font-serif font-light mb-4 text-[#EAEAEA]">Enjoyed this article?</h3>
            <p className="text-[#888888] mb-6 font-mono text-sm">
              Want to discuss more? Get in touch or read more of my thoughts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/thoughts"
                className="px-6 py-3 bg-[#EAEAEA] text-[#050505] font-mono text-xs uppercase tracking-widest rounded-full hover:bg-white transition-colors"
              >
                Read More Thoughts
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 border border-white/10 text-[#EAEAEA] font-mono text-xs uppercase tracking-widest rounded-full hover:bg-white/5 transition-colors"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </motion.footer>
      </div>

      <style jsx>{`
        .article-content h1 {
          font-family: var(--font-cormorant), serif;
          font-size: 2.5rem;
          font-weight: 300;
          margin: 3rem 0 1.5rem 0;
          color: #EAEAEA;
          letter-spacing: -0.02em;
        }
        .article-content h2 {
          font-family: var(--font-cormorant), serif;
          font-size: 2rem;
          font-weight: 300;
          margin: 2.5rem 0 1.25rem 0;
          color: #EAEAEA;
          letter-spacing: -0.01em;
        }
        .article-content h3 {
          font-family: var(--font-cormorant), serif;
          font-size: 1.5rem;
          font-weight: 400;
          margin: 2rem 0 1rem 0;
          color: #EAEAEA;
        }
        .article-content p {
          font-family: 'Inter', sans-serif;
          margin-bottom: 1.5rem;
          line-height: 1.8;
          font-size: 1.125rem;
          color: #EAEAEA;
          font-weight: 300;
        }
        .article-content ul, .article-content ol {
          margin: 1.5rem 0;
          padding-left: 1.5rem;
          color: #EAEAEA;
        }
        .article-content li {
          margin: 1rem 0;
          line-height: 1.8;
          font-weight: 300;
        }
        .article-content strong {
          color: #FFFFFF;
          font-weight: 500;
        }
        .article-content em {
          color: #EAEAEA;
          font-style: italic;
        }
        .article-content code {
          background: rgba(255, 255, 255, 0.05);
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: var(--font-jetbrains), monospace;
          font-size: 0.9em;
          color: #EAEAEA;
        }
        .article-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .gallery-image {
          width: 100%;
          height: auto;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .gallery-image:hover {
          transform: scale(1.02);
          box-shadow: 0 10px 25px rgba(255, 255, 255, 0.05);
        }
        .article-videos {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin: 2rem 0;
        }
        .article-videos iframe {
          width: 100%;
          max-width: 560px;
          height: 315px;
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .article-videos {
            flex-direction: row;
            justify-content: center;
          }
          .article-videos iframe {
            flex: 1;
            max-width: calc(50% - 0.75rem);
          }
        }
      `}</style>
    </div>
  )
}
