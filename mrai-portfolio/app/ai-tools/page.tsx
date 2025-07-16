'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'

const tools = [
  {
    id: 1,
    name: 'Voice-to-Article Generator',
    description: 'Transform voice memos into polished articles with AI-generated images and SEO optimization.',
    longDescription: 'Upload a voice recording and our AI will transcribe, structure, and enhance your thoughts into publication-ready articles complete with relevant imagery.',
    category: 'Content Creation',
    status: 'Live',
    features: [
      'Whisper API transcription',
      'GPT-4 content structuring',
      'DALL-E image generation',
      'SEO optimization',
      'Multiple export formats'
    ],
    tech: ['OpenAI API', 'Next.js', 'TypeScript', 'Tailwind'],
    demoAvailable: true,
    comingSoon: false,
  },
  {
    id: 2,
    name: 'Smart Text Summarizer',
    description: 'Extract key insights from long documents using advanced NLP and present them in digestible formats.',
    longDescription: 'Analyze lengthy documents, research papers, or articles to generate concise summaries with key takeaways and actionable insights.',
    category: 'Text Analysis',
    status: 'Beta',
    features: [
      'Multi-document analysis',
      'Key insight extraction',
      'Customizable summary length',
      'Citation preservation',
      'Export to multiple formats'
    ],
    tech: ['Transformers', 'Python', 'FastAPI', 'React'],
    demoAvailable: true,
    comingSoon: false,
  },
  {
    id: 3,
    name: 'Code Documentation Assistant',
    description: 'Automatically generate comprehensive documentation for codebases using AI analysis.',
    longDescription: 'Scan your repository and generate detailed documentation including API references, code explanations, and usage examples.',
    category: 'Developer Tools',
    status: 'Development',
    features: [
      'Multi-language support',
      'API documentation',
      'Code explanation',
      'Usage examples',
      'Integration guides'
    ],
    tech: ['CodeT5', 'TypeScript', 'GitHub API', 'Markdown'],
    demoAvailable: false,
    comingSoon: true,
  },
  {
    id: 4,
    name: 'Image Style Transfer Studio',
    description: 'Real-time artistic style transfer powered by neural networks for creative image transformation.',
    longDescription: 'Apply artistic styles to your images in real-time using state-of-the-art neural style transfer algorithms.',
    category: 'Image Processing',
    status: 'Research',
    features: [
      'Real-time processing',
      'Custom style training',
      'Batch processing',
      'High-resolution output',
      'Style mixing'
    ],
    tech: ['PyTorch', 'WebGL', 'Canvas API', 'TensorFlow.js'],
    demoAvailable: false,
    comingSoon: true,
  },
  {
    id: 5,
    name: 'Sentiment Analysis Dashboard',
    description: 'Real-time sentiment analysis and emotional intelligence insights from text data.',
    longDescription: 'Analyze sentiment, emotions, and intent from customer feedback, social media, or any text data with detailed analytics.',
    category: 'Analytics',
    status: 'Live',
    features: [
      'Real-time analysis',
      'Emotion detection',
      'Trend visualization',
      'Export reports',
      'API integration'
    ],
    tech: ['BERT', 'D3.js', 'PostgreSQL', 'Express'],
    demoAvailable: true,
    comingSoon: false,
  },
  {
    id: 6,
    name: 'AI Chat Interface Builder',
    description: 'Create custom AI chatbots with advanced conversational capabilities and knowledge integration.',
    longDescription: 'Build sophisticated chatbots that can understand context, access custom knowledge bases, and provide intelligent responses.',
    category: 'Conversational AI',
    status: 'Planning',
    features: [
      'Custom knowledge base',
      'Context awareness',
      'Multi-language support',
      'Integration APIs',
      'Analytics dashboard'
    ],
    tech: ['GPT-4', 'Vector DB', 'WebSocket', 'React'],
    demoAvailable: false,
    comingSoon: true,
  },
]

const categories = ['All', 'Content Creation', 'Text Analysis', 'Developer Tools', 'Image Processing', 'Analytics', 'Conversational AI']

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

export default function AIToolsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedTool, setSelectedTool] = useState<typeof tools[0] | null>(null)
  
  const filteredTools = selectedCategory === 'All' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory)

  return (
    <div className="min-h-screen relative">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 60 0 L 0 0 0 60" fill="none" stroke="white" stroke-width="0.5" opacity="0.03"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%25" height="100%25" fill="url(%23grid)"/%3E%3C/svg%3E')] opacity-20" />
      
      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-space font-black mb-6">
            <span className="text-gradient">AI Tools</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed mb-8">
            A collection of AI-powered tools and applications built to enhance productivity and creativity
          </p>
          
          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-ai-green">{tools.length}</div>
              <div className="text-sm text-gray-400">Total Tools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-ai-blue">{tools.filter(t => t.status === 'Live').length}</div>
              <div className="text-sm text-gray-400">Live Tools</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{tools.filter(t => t.comingSoon).length}</div>
              <div className="text-sm text-gray-400">Coming Soon</div>
            </div>
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-ai-green to-ai-blue text-black'
                  : 'glass border border-white/20 text-gray-300 hover:border-ai-green/50 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Tools Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredTools.map((tool) => (
            <motion.div
              key={tool.id}
              variants={item}
              whileHover={{ y: -5 }}
              className="group relative cursor-pointer"
              onClick={() => setSelectedTool(tool)}
            >
              <div className="glass p-6 rounded-2xl border border-white/10 hover:border-ai-green/30 transition-all h-full flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-ai-green/20 text-ai-green">
                    {tool.category}
                  </span>
                  <div className="flex items-center gap-2">
                    {tool.demoAvailable && (
                      <div className="w-2 h-2 bg-ai-green rounded-full animate-pulse" />
                    )}
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      tool.status === 'Live' ? 'bg-ai-green/20 text-ai-green' :
                      tool.status === 'Beta' ? 'bg-ai-blue/20 text-ai-blue' :
                      tool.status === 'Development' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {tool.status}
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 group-hover:text-gradient transition-all">
                  {tool.name}
                </h3>

                {/* Description */}
                <p className="text-gray-400 mb-4 flex-grow leading-relaxed">
                  {tool.description}
                </p>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {tool.tech.slice(0, 3).map((tech) => (
                    <span
                      key={tech}
                      className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-400"
                    >
                      {tech}
                    </span>
                  ))}
                  {tool.tech.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-400">
                      +{tool.tech.length - 3}
                    </span>
                  )}
                </div>

                {/* Action */}
                <div className="flex gap-2">
                  {tool.demoAvailable ? (
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-ai-green to-ai-blue text-black font-medium rounded-lg hover:scale-105 transition-transform text-sm">
                      Try Demo
                    </button>
                  ) : (
                    <button className="flex-1 px-4 py-2 glass border border-white/20 rounded-lg hover:border-ai-green/50 transition-all text-sm">
                      {tool.comingSoon ? 'Coming Soon' : 'Learn More'}
                    </button>
                  )}
                </div>
              </div>
              
              {/* Glow effect on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-ai-green/20 to-ai-blue/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </motion.div>
          ))}
        </motion.div>

        {/* Tool Detail Modal */}
        {selectedTool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedTool(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass p-8 rounded-2xl border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{selectedTool.name}</h2>
                  <span className="text-sm px-3 py-1 rounded-full bg-ai-green/20 text-ai-green">
                    {selectedTool.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTool(null)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <p className="text-gray-400 mb-6 leading-relaxed">
                {selectedTool.longDescription}
              </p>
              
              <h3 className="text-lg font-semibold mb-3">Features</h3>
              <ul className="space-y-2 mb-6">
                {selectedTool.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <div className="w-1.5 h-1.5 bg-ai-green rounded-full mt-2 flex-shrink-0"></div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <h3 className="text-lg font-semibold mb-3">Technology Stack</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedTool.tech.map((tech) => (
                  <span
                    key={tech}
                    className="px-3 py-1 bg-white/5 rounded-full text-sm"
                  >
                    {tech}
                  </span>
                ))}
              </div>
              
              <div className="flex gap-3">
                {selectedTool.demoAvailable ? (
                  <button className="px-6 py-3 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform">
                    Try Demo
                  </button>
                ) : (
                  <button className="px-6 py-3 glass border border-white/20 rounded-full hover:border-ai-green/50 transition-all">
                    {selectedTool.comingSoon ? 'Coming Soon' : 'Request Access'}
                  </button>
                )}
                <Link
                  href="/contact"
                  className="px-6 py-3 glass border border-white/20 rounded-full hover:border-ai-green/50 transition-all"
                >
                  Contact About Tool
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-20"
        >
          <div className="glass p-8 rounded-2xl border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Have an AI Tool Idea?</h3>
            <p className="text-gray-400 mb-6">
              I'm always working on new AI-powered solutions. If you have an idea for a tool or want to collaborate on an AI project, let's discuss it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform"
              >
                Discuss Your Idea
              </Link>
              <Link
                href="/projects"
                className="px-6 py-3 glass border border-white/20 rounded-full hover:border-ai-green/50 transition-all"
              >
                View All Projects
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}