'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

const thoughts = [
  {
    id: 1,
    title: 'THE EDGE OF VIBE CODING',
    excerpt: 'Exploring the limits and challenges of AI-assisted programming, including database integration friction and the advantages of file-based formats.',
    content: 'In the world of Vibe Coding, we encounter fascinating challenges. Database integration creates friction, while file-based formats offer distinct advantages. The recommendation is clear: keep projects local as long as possible to maintain development velocity.',
    tags: ['Vibe Coding', 'AI Programming', 'Development'],
    readTime: '4 min read',
    publishedAt: '2024-01-20',
    author: 'Amir Jalali',
  },
  {
    id: 2,
    title: '4O Image Generation',
    excerpt: 'OpenAI\'s 4o image generation model represents a breakthrough with its multimodal-native, non-diffusion-based architecture.',
    content: 'OpenAI\'s 4o image generation model marks a significant advancement in AI image creation. With its multimodal-native architecture and non-diffusion-based approach, it delivers improved usability and enables better collaboration between different AI modalities.',
    tags: ['OpenAI', 'Image Generation', 'Multimodal AI'],
    readTime: '3 min read',
    publishedAt: '2024-01-18',
    author: 'Amir Jalali',
  },
  {
    id: 3,
    title: 'The ERA of VIBE CODING',
    excerpt: 'A new programming paradigm using LLMs to write software with AI assistance without manual coding, revolutionizing efficiency for all skill levels.',
    content: 'We are entering the era of Vibe Coding - a revolutionary programming paradigm where developers write software using LLM assistance without manual coding. This approach delivers significant efficiency gains for both experienced and junior programmers, similar to how MidJourney transformed image generation.',
    tags: ['Vibe Coding', 'LLMs', 'Programming Paradigm'],
    readTime: '6 min read',
    publishedAt: '2024-01-15',
    author: 'Amir Jalali',
  },
  {
    id: 4,
    title: 'DeepSEEK',
    excerpt: 'A cost-effective AI development breakthrough that enables major cost reductions and democratizes AI access across the industry.',
    content: 'DeepSEEK represents a breakthrough in cost-effective AI development. By enabling major cost reductions, it democratizes AI access and increases competition while promoting sustainable innovation across the industry.',
    tags: ['DeepSEEK', 'Cost Reduction', 'AI Democratization'],
    readTime: '5 min read',
    publishedAt: '2024-01-12',
    author: 'Amir Jalali',
  },
  {
    id: 5,
    title: 'REASONING MODELS',
    excerpt: 'Chain of Thought prompting and structured AI reasoning for mathematics, research, law, and medical diagnostics with reduced hallucinations.',
    content: 'Reasoning models utilizing Chain of Thought prompting offer structured AI reasoning capabilities. These models excel in mathematics, research, law, and medical diagnostics by providing reduced hallucinations and improved reliability in complex problem-solving scenarios.',
    tags: ['Reasoning Models', 'Chain of Thought', 'AI Reliability'],
    readTime: '7 min read',
    publishedAt: '2024-01-10',
    author: 'Amir Jalali',
  },
  {
    id: 6,
    title: 'CHAIN OF THOUGHT',
    excerpt: 'A prompting technique for complex problem-solving that teaches step-by-step reasoning and provides interpretable decision-making.',
    content: 'Chain of Thought prompting is a revolutionary technique for complex problem-solving. By teaching AI systems step-by-step reasoning, it enables interpretable decision-making and transparent problem-solving processes, making AI more trustworthy and understandable.',
    tags: ['Chain of Thought', 'Problem Solving', 'AI Transparency'],
    readTime: '5 min read',
    publishedAt: '2024-01-08',
    author: 'Amir Jalali',
  },
  {
    id: 7,
    title: 'LLAMA3 and the era of abundant ai',
    excerpt: 'Meta\'s LLAMA3 impact on AI accessibility, bringing abundant intelligence and cost reduction with both positive and negative societal implications.',
    content: 'Meta\'s LLAMA3 represents a pivotal moment in AI accessibility. By enabling abundant intelligence and significant cost reduction, it carries both tremendous potential for positive impact and legitimate concerns about potential negative societal consequences that must be carefully managed.',
    tags: ['LLAMA3', 'AI Accessibility', 'Societal Impact'],
    readTime: '6 min read',
    publishedAt: '2024-01-05',
    author: 'Amir Jalali',
  },
  {
    id: 8,
    title: 'THE NEXT GREAT DATA CROP',
    excerpt: 'Exploring personal data value and AI training quality concerns, including bot-generated content diluting data quality and economic models.',
    content: 'The next great data crop focuses on personal data value and AI training quality. As bot-generated content increasingly dilutes data quality, we must explore new economic models for high-quality data creation and preservation to maintain AI system effectiveness.',
    tags: ['Data Quality', 'AI Training', 'Economic Models'],
    readTime: '8 min read',
    publishedAt: '2024-01-03',
    author: 'Amir Jalali',
  },
  {
    id: 9,
    title: 'Are we our IDEAS?',
    excerpt: 'A philosophical exploration of identity, creativity, and the relationship between our thoughts and our sense of self.',
    content: 'This philosophical exploration delves into the fundamental question of identity: are we defined by our ideas? Examining the relationship between our thoughts, creativity, and sense of self reveals complex interconnections that challenge traditional notions of personal identity.',
    tags: ['Philosophy', 'Identity', 'Creativity'],
    readTime: '4 min read',
    publishedAt: '2024-01-01',
    author: 'Amir Jalali',
  },
  {
    id: 10,
    title: 'Synthetic Data vs \'Real\' DATA',
    excerpt: 'Comparing synthetic and real data in AI training, exploring quality, authenticity, and the implications for model performance.',
    content: 'The debate between synthetic and real data in AI training raises fundamental questions about quality, authenticity, and model performance. Understanding the trade-offs and implications helps inform better data strategy decisions for AI development.',
    tags: ['Synthetic Data', 'AI Training', 'Data Strategy'],
    readTime: '6 min read',
    publishedAt: '2023-12-28',
    author: 'Amir Jalali',
  },
]

const categories = ['All', 'Vibe Coding', 'AI Programming', 'Philosophy', 'AI Training', 'LLMs', 'Data Strategy']

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

export default function ThoughtsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  
  const filteredThoughts = selectedCategory === 'All' 
    ? thoughts 
    : thoughts.filter(thought => thought.tags.includes(selectedCategory))

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
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
            Insights on AI trends, programming paradigms, and the future of technology
          </p>
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
              className={`px-4 py-2 rounded-full font-medium transition-all text-sm ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-ai-green to-ai-blue text-black'
                  : 'glass border border-white/20 text-gray-300 hover:border-ai-green/50 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Thoughts Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredThoughts.map((thought) => (
            <motion.article
              key={thought.id}
              variants={item}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="glass p-6 rounded-2xl border border-white/10 hover:border-ai-green/30 transition-all duration-300 h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs text-gray-400">{thought.author}</span>
                  <span className="text-xs text-gray-500">{thought.readTime}</span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold mb-3 group-hover:text-gradient transition-all">
                  {thought.title}
                </h2>

                {/* Excerpt */}
                <p className="text-gray-400 mb-4 flex-grow leading-relaxed text-sm">
                  {thought.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {thought.tags.map((tag) => (
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
                    {new Date(thought.publishedAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/articles/${thought.id}`}
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
            <h3 className="text-2xl font-bold mb-4">Share Your Thoughts</h3>
            <p className="text-gray-400 mb-6">
              Have ideas about AI, technology, or programming? Use the AI assistant to turn your thoughts into compelling articles.
            </p>
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
          </div>
        </motion.div>
      </div>
    </div>
  )
}