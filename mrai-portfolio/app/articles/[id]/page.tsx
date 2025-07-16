'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const articles = [
  {
    id: '1',
    title: 'The Future of AI-Powered Content Creation',
    excerpt: 'Exploring how artificial intelligence is revolutionizing the way we create, edit, and distribute content across digital platforms.',
    content: `# The Future of AI-Powered Content Creation

In the rapidly evolving landscape of digital content creation, artificial intelligence has emerged as a transformative force that's reshaping how we conceive, produce, and distribute content across various platforms.

## The Current State of AI in Content Creation

Today's AI systems have moved far beyond simple text generation. Modern platforms can:

- **Generate compelling narratives** from simple prompts
- **Create stunning visuals** that complement written content
- **Optimize content** for specific audiences and platforms
- **Translate and adapt** content across languages and cultures

## Revolutionary Applications

### Voice-to-Article Systems
One of the most exciting developments is the ability to transform voice recordings into polished articles. This technology:

- Transcribes spoken thoughts with high accuracy
- Structures rambling ideas into coherent narratives
- Generates relevant images and media
- Optimizes for SEO and readability

### Real-time Content Adaptation
AI can now adapt content in real-time based on:
- Reader engagement patterns
- Current trending topics
- Audience demographics
- Platform-specific requirements

## The Human-AI Collaboration Model

Rather than replacing human creativity, AI amplifies it. The most successful content strategies combine:

1. **Human insight and creativity** for direction and authenticity
2. **AI processing power** for research and optimization
3. **Automated systems** for distribution and analytics
4. **Feedback loops** for continuous improvement

## Challenges and Considerations

While the potential is enormous, we must address:

- **Quality control** and fact-checking
- **Ethical implications** of automated content
- **Authenticity** and human connection
- **Economic impact** on content creators

## Looking Forward

The future of content creation lies not in choosing between human or AI, but in finding the perfect synthesis. As these tools become more sophisticated, we'll see:

- More personalized content experiences
- Faster iteration and testing cycles
- Greater accessibility for non-technical creators
- Enhanced creative possibilities

The revolution is just beginning, and those who embrace this human-AI partnership will lead the next era of digital communication.`,
    tags: ['AI', 'Content Creation', 'Technology'],
    readTime: '5 min read',
    publishedAt: '2024-01-15',
    aiGenerated: true,
    author: 'MR AI',
  },
  // Add more articles as needed
]

export default function ArticlePage({ params }: { params: { id: string } }) {
  const article = articles.find(a => a.id === params.id)
  
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
            href="/articles"
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
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-white/5 rounded-full text-sm text-gray-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </motion.header>

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
              __html: article.content.replace(/\n/g, '<br/>').replace(/## (.*)/g, '<h2>$1</h2>').replace(/### (.*)/g, '<h3>$1</h3>').replace(/# (.*)/g, '<h1>$1</h1>')
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
              Explore more AI-generated insights and stay updated with the latest in technology.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/articles"
                className="px-6 py-3 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform"
              >
                Read More Articles
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 glass border border-white/20 rounded-full hover:border-ai-green/50 transition-all"
              >
                Get in Touch
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