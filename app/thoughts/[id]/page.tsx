'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useParams, notFound } from 'next/navigation'
import { useEffect, useState } from 'react'
import { getArticleById } from '@/lib/articles'

export default function ThoughtPage() {
  const params = useParams()
  const id = params.id as string
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadedArticle = getArticleById(id)
    if (!loadedArticle) {
      notFound()
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
      
      <div className="relative z-10 px-6 py-20 max-w-4xl mx-auto">
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

        {/* Article Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {/* AI Badge */}
          {article.aiGenerated && (
            <div className="inline-flex items-center gap-2 px-3 py-1 glass rounded-full border border-ai-green/30 mb-6">
              <div className="w-2 h-2 bg-ai-green rounded-full animate-pulse" />
              <span className="text-xs text-ai-green font-medium">AI Generated</span>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl font-space font-black mb-6 leading-tight">
            <span className="text-gradient">{article.title}</span>
          </h1>

          <p className="text-xl text-gray-400 mb-8 leading-relaxed">
            {article.excerpt}
          </p>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <span>By {article.author}</span>
            </div>
            <div>{new Date(article.publishedAt).toLocaleDateString()}</div>
            <div>{article.readTime}</div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-6">
            {article.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.header>

        {/* Article Image */}
        {article.imageUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-12"
          >
            <img 
              src={article.imageUrl} 
              alt={article.title}
              className="w-full rounded-2xl border border-white/10"
            />
          </motion.div>
        )}

        {/* Article Content */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
      `}</style>
    </div>
  )
}