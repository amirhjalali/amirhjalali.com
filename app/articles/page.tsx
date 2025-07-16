'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { getArticles, initializeDefaultArticles } from '@/lib/articles'

const articles = [
  {
    id: 1,
    title: 'The Future of AI-Powered Content Creation',
    excerpt: 'Exploring how artificial intelligence is revolutionizing the way we create, edit, and distribute content across digital platforms.',
    content: 'In the rapidly evolving landscape of digital content creation, artificial intelligence has emerged as a transformative force...',
    tags: ['AI', 'Content Creation', 'Technology'],
    readTime: '5 min read',
    publishedAt: '2024-01-15',
    aiGenerated: true,
    author: 'MR AI',
  },
  {
    id: 2,
    title: 'Building Responsive AI Systems',
    excerpt: 'How to design AI systems that adapt to user needs and provide meaningful interactions in real-world applications.',
    content: 'Creating AI systems that truly serve users requires more than just advanced algorithms...',
    tags: ['Machine Learning', 'UX', 'System Design'],
    readTime: '8 min read',
    publishedAt: '2024-01-10',
    aiGenerated: true,
    author: 'MR AI',
  },
  {
    id: 3,
    title: 'The Ethics of Automated Content',
    excerpt: 'Examining the responsibility and considerations when deploying AI for content generation at scale.',
    content: 'As AI-generated content becomes more prevalent, we must carefully consider the ethical implications...',
    tags: ['Ethics', 'AI', 'Philosophy'],
    readTime: '12 min read',
    publishedAt: '2024-01-05',
    aiGenerated: true,
    author: 'MR AI',
  },
]

const categories = ['All', 'AI', 'Technology', 'Ethics', 'Machine Learning']

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function ArticlesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [allArticles, setAllArticles] = useState<any[]>([])
  
  useEffect(() => {
    // Initialize default articles if needed
    initializeDefaultArticles()
    // Load all articles from storage
    const storedArticles = getArticles()
    setAllArticles(storedArticles)
  }, [])
  
  const filteredArticles = selectedCategory === 'All' 
    ? allArticles 
    : allArticles.filter(article => article.tags.some(tag => tag === selectedCategory))

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
            <span className="text-gradient">AI Insights</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Thoughts, research, and insights on artificial intelligence, technology, and the future of human-AI collaboration
          </p>
          
          {/* AI Generation Notice */}
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full border border-ai-green/30">
            <div className="w-2 h-2 bg-ai-green rounded-full animate-pulse" />
            <span className="text-sm text-ai-green font-medium">AI-Powered Content Generation</span>
          </div>
        </motion.div>

        {/* Categories Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-16"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-ai-green to-ai-blue text-black'
                  : 'glass border border-white/20 text-gray-300 hover:border-ai-green/50 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Articles Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredArticles.map((article) => (
            <motion.article
              key={article.id}
              variants={item}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="glass p-6 rounded-2xl border border-white/10 hover:border-ai-green/30 transition-all duration-300 h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {article.aiGenerated && (
                      <div className="w-3 h-3 bg-ai-green rounded-full" />
                    )}
                    <span className="text-xs text-gray-400">{article.author}</span>
                  </div>
                  <span className="text-xs text-gray-500">{article.readTime}</span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold mb-3 group-hover:text-gradient transition-all line-clamp-2">
                  {article.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-400 mb-4 flex-grow leading-relaxed">
                  {article.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Meta and CTA */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/articles/${article.id}`}
                    className="text-ai-green hover:text-ai-green/80 font-medium text-sm transition-colors group-hover:gap-2 inline-flex items-center gap-1"
                  >
                    Read More
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
              
              {/* Glow effect on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-ai-green/10 to-ai-blue/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </motion.article>
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
            <h3 className="text-2xl font-bold mb-4">Generate New Content</h3>
            <p className="text-gray-400 mb-6">
              Use AI to transform your voice memos, ideas, or thoughts into compelling articles with automated image generation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/generate"
                className="px-6 py-3 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform inline-block text-center"
              >
                Generate New Article
              </Link>
              <Link
                href="/generate"
                className="px-6 py-3 glass border border-white/20 rounded-full hover:border-ai-green/50 transition-all inline-block text-center"
              >
                Voice to Article
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}