'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getArticles, initializeDefaultArticles } from '@/lib/articles'
import LazyImage from '@/components/LazyImage'

// Helper to add basePath to image URLs
const getImageUrl = (url: string | undefined) => {
  if (!url) return undefined
  const basePath = process.env.NODE_ENV === 'production' ? '/amirhjalali.com' : ''
  return url.startsWith('/') ? `${basePath}${url}` : url
}

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
  const router = useRouter()
  const [allArticles, setAllArticles] = useState<any[]>([])
  
  useEffect(() => {
    // Initialize default articles if needed
    initializeDefaultArticles()
    // Load all articles from storage and sort by date (newest first)
    const storedArticles = getArticles()
    const sortedArticles = storedArticles.sort((a, b) => {
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    })
    setAllArticles(sortedArticles)
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
          <h1 className="text-5xl md:text-7xl font-space mb-6">
            <span className="text-gradient">Thoughts</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto">
            Insights on AI trends, programming paradigms, and the future of technology
          </p>
        </motion.div>

        {/* Thought Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
        >
          {allArticles.map((article, index) => (
            <motion.div
              key={article.id}
              variants={item}
              whileHover={{ 
                y: -8,
                scale: 1.02
              }}
              className="group relative cursor-pointer"
              onClick={() => router.push(`/thoughts/${article.id}`)}
              style={{
                transform: `rotate(${index % 2 === 0 ? -0.5 : 0.5}deg)` // Subtle rotation based on index
              }}
            >
              {/* Thought bubble tail */}
              <div className="absolute -bottom-3 left-6 w-4 h-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 group-hover:bg-ai-teal/20 dark:group-hover:bg-ai-green/20 transition-all duration-300"></div>
              <div className="absolute -bottom-1 left-9 w-2 h-2 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 group-hover:bg-ai-teal/20 dark:group-hover:bg-ai-green/20 transition-all duration-300"></div>
              
              {/* Main card */}
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden hover:bg-ai-teal/10 dark:hover:bg-ai-green/10 hover:border-ai-teal/30 dark:hover:border-ai-green/30 transition-all duration-300 h-full flex flex-col">
                
                {/* Image */}
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
                    
                    {/* AI indicator on image */}
                    {article.aiGenerated && (
                      <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-ai-teal/90 dark:bg-ai-green/90 rounded-full text-xs font-medium text-white">
                        <div className="w-2 h-2 bg-black rounded-full animate-pulse" />
                        AI
                      </div>
                    )}
                  </div>
                )}
                
                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  {/* Header info */}
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs text-gray-400">{article.author}</span>
                    <span className="text-xs text-gray-500">{article.readTime}</span>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-xl mb-3 text-white group-hover:text-gradient transition-all duration-300 line-clamp-2">
                    {article.title}
                  </h3>

                  {/* Excerpt */}
                  <p className="text-gray-300 text-sm line-clamp-3 mb-4 flex-grow">
                    {article.excerpt}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {article.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-white/10 rounded-full text-gray-400 group-hover:text-ai-teal dark:group-hover:text-ai-green transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                    {article.tags.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-gray-500">
                        +{article.tags.length - 3}
                      </span>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">
                      {new Date(article.publishedAt).toLocaleDateString()}
                    </span>
                    <span className="text-ai-teal dark:text-ai-green opacity-0 group-hover:opacity-100 transition-opacity duration-300 font-medium">
                      Read more →
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Glow effect on hover */}
              <div className="absolute -inset-2 bg-gradient-to-r from-ai-teal/20 to-ai-cyan/20 dark:from-ai-green/20 dark:to-ai-blue/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
              
              {/* Floating thought particles */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                {[...Array(2)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-ai-teal/60 dark:bg-ai-green/60 rounded-full"
                    initial={{ 
                      x: 50 + i * 50,
                      y: 50 + i * 50,
                      opacity: 0 
                    }}
                    animate={{
                      x: 100 + i * 50,
                      y: 100 + i * 50,
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 1,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Create New Article CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-20"
        >
          <div className="glass p-8 rounded-2xl border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-2xl mb-4">Share Your Thoughts</h3>
            <p className="text-gray-400 mb-6">
              Have ideas about AI, technology, or programming? Use the AI assistant to turn your thoughts into compelling articles.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/generate"
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-ai-teal to-ai-cyan dark:from-ai-green dark:to-ai-blue text-white font-semibold rounded-full hover:scale-105 transition-transform inline-block text-center text-sm sm:text-base"
              >
                Generate New Article
              </Link>
              <Link
                href="/contact"
                className="px-4 sm:px-6 py-2.5 sm:py-3 glass border border-white/20 rounded-full hover:border-ai-teal/50 dark:hover:border-ai-green/50 transition-all inline-block text-center text-sm sm:text-base"
              >
                Get in Touch
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}