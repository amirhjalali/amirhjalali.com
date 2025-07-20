'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getArticles, initializeDefaultArticles } from '@/lib/articles'
import LazyImage from '@/components/LazyImage'

// Articles are now loaded dynamically from the articles library

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 }
}

export default function ThoughtsPage() {
  const [allArticles, setAllArticles] = useState<any[]>([])
  
  useEffect(() => {
    // Initialize default articles if needed
    initializeDefaultArticles()
    // Load all articles from storage
    const storedArticles = getArticles()
    setAllArticles(storedArticles)
  }, [])

  return (
    <div className="min-h-screen relative">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
      
      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-space font-black mb-6">
            <span className="text-gradient">Thoughts</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Insights on AI trends, programming paradigms, and the future of technology
          </p>
        </motion.div>

        {/* Articles - Vertical Scroll Layout */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-20 max-w-5xl mx-auto"
        >
          {allArticles.map((article, index) => (
            <motion.article
              key={article.id}
              variants={item}
              className="relative"
            >
              {/* Divider between articles */}
              {index > 0 && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              )}

              {/* Article Image - Full Width */}
              {article.imageUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="mb-8 overflow-hidden rounded-2xl border border-white/10"
                >
                  <LazyImage 
                    src={article.imageUrl} 
                    alt={article.title}
                    className="hover:scale-105 transition-transform duration-700"
                    wrapperClassName="w-full"
                    aspectRatio="wide"
                    placeholder="skeleton"
                    priority={index < 2}
                  />
                </motion.div>
              )}
              
              {/* Article Content */}
              <div className="glass p-8 md:p-12 rounded-2xl border border-white/10">
                {/* Meta Info */}
                <div className="flex items-center gap-4 mb-6 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    {article.aiGenerated && (
                      <div className="w-2 h-2 bg-ai-green rounded-full animate-pulse" />
                    )}
                    <span>{article.author}</span>
                  </div>
                  <span>•</span>
                  <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{article.readTime}</span>
                </div>

                {/* Title */}
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient">
                  {article.title}
                </h2>

                {/* Full Content - Rendered as HTML */}
                <div 
                  className="prose prose-lg prose-invert max-w-none mb-8"
                  dangerouslySetInnerHTML={{ 
                    __html: article.content
                      .replace(/\n\n/g, '</p><p class="mb-4 text-gray-300 leading-relaxed">')
                      .replace(/\n/g, '<br/>')
                      .replace(/^/, '<p class="mb-4 text-gray-300 leading-relaxed">')
                      .replace(/$/, '</p>')
                      .replace(/## (.*)/g, '<h2 class="text-2xl font-bold mt-8 mb-4 text-white">$1</h2>')
                      .replace(/### (.*)/g, '<h3 class="text-xl font-semibold mt-6 mb-3 text-ai-green">$1</h3>')
                      .replace(/# (.*)/g, '<h1 class="text-3xl font-bold mt-8 mb-4 text-gradient">$1</h1>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em class="text-ai-green">$1</em>')
                      .replace(/- (.*)/g, '<li class="ml-6 mb-2 text-gray-300">$1</li>')
                      .replace(/(<li.*?<\/li>)/g, '<ul class="mb-4">$1</ul>')
                      .replace(/<\/ul><ul class="mb-4">/g, '')
                  }} 
                />

                {/* Tags */}
                <div className="flex flex-wrap gap-2 pt-6 border-t border-white/10">
                  {article.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-400 hover:bg-white/10 transition-colors cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Bottom Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-20"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/generate"
              className="px-6 py-3 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform inline-block text-center"
            >
              Generate New Article
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 glass border border-white/20 rounded-full hover:border-ai-green/50 transition-all inline-block text-center"
            >
              Get in Touch
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}