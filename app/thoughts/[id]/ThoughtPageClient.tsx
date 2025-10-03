'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getArticleById, initializeDefaultArticles } from '@/lib/articles'
import SocialShare from '@/components/SocialShare'

// Helper to add basePath to image URLs
const getImageUrl = (url: string | undefined) => {
  if (!url) return undefined
  const basePath = process.env.NODE_ENV === 'production' ? '/amirhjalali.com' : ''
  return url.startsWith('/') ? `${basePath}${url}` : url
}

export default function ThoughtPageClient({ id }: { id: string }) {
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Initialize default articles if needed
    initializeDefaultArticles()

    // Load the specific article
    const loadedArticle = getArticleById(id)
    if (!loadedArticle) {
      setLoading(false)
      return
    }
    setArticle(loadedArticle)
    setLoading(false)
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-ai-green border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!article) {
    notFound()
  }

  return (
    <div className="min-h-screen relative">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient opacity-10" />

      <div className="relative z-10 px-6 py-20 max-w-5xl mx-auto">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link
            href="/thoughts"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
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
          <p className="text-xl text-gray-400 mb-6 leading-relaxed font-light">
            {article.excerpt}
          </p>

          {/* Tags and Social Share */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-sm text-gray-400 transition-colors"
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
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              {/* Image overlay with article title */}
              <div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12">
                <div className="max-w-4xl">
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-4xl md:text-5xl lg:text-6xl font-space font-black mb-4 text-white leading-tight"
                  >
                    {article.title}
                  </motion.h1>

                  {/* Meta info overlay */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap items-center gap-4 text-white/90"
                  >
                    <span>By {article.author}</span>
                    <span>•</span>
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{article.readTime}</span>
                    {article.aiGenerated && (
                      <>
                        <span>•</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-ai-green/20 rounded-full border border-ai-green/30">
                          <div className="w-2 h-2 bg-ai-green rounded-full animate-pulse" />
                          <span className="text-xs font-medium text-ai-green">AI Generated</span>
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
            className="article-content"
            dangerouslySetInnerHTML={{
              __html: article.content
                .replace(/\n/g, '<br/>')
                .replace(/## (.*)/g, '<h2>$1</h2>')
                .replace(/### (.*)/g, '<h3>$1</h3>')
                .replace(/# (.*)/g, '<h1>$1</h1>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/• \*\*(.*?)\*\*/g, '• <strong>$1</strong>')
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
            <h3 className="text-xl font-bold mb-4">Enjoyed this article?</h3>
            <p className="text-gray-400 mb-6">
              Explore more insights or create your own AI-powered articles.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/thoughts"
                className="px-6 py-3 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform"
              >
                Read More Thoughts
              </Link>
              <Link
                href="/generate"
                className="px-6 py-3 glass border border-white/20 rounded-full hover:border-ai-green/50 transition-all"
              >
                Generate New Article
              </Link>
            </div>
          </div>
        </motion.footer>
      </div>

      <style jsx>{`
        .article-content h1 {
          font-size: 2rem;
          font-weight: bold;
          margin: 2rem 0 1rem 0;
          background: linear-gradient(to right, #00FF88, #00D9FF);
          background-clip: text;
          -webkit-background-clip: text;
          color: transparent;
        }
        .article-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.5rem 0 1rem 0;
          color: white;
        }
        .article-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
          color: #00FF88;
        }
        .article-content p {
          margin-bottom: 1rem;
          line-height: 1.7;
          color: #d1d5db;
        }
        .article-content ul, .article-content ol {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        .article-content li {
          margin: 0.5rem 0;
          color: #d1d5db;
        }
        .article-content strong {
          color: white;
          font-weight: 600;
        }
        .article-content em {
          color: #00FF88;
        }
        .article-content code {
          background: rgba(255, 255, 255, 0.1);
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: monospace;
        }
        .article-gallery {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 2rem 0;
          padding: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 1rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .gallery-image {
          width: 100%;
          height: auto;
          border-radius: 0.75rem;
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .gallery-image:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 25px rgba(0, 255, 136, 0.2);
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
          border: 1px solid rgba(255, 255, 255, 0.1);
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
