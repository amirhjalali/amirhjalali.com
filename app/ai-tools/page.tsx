'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'

const tools = [
  {
    id: 1,
    name: 'REPLIT AGENT',
    description: 'Agent-based AI tool for rapid code development and deployment',
    longDescription: 'Most effective workflow for Proof of Concept and MVP shipping with hosted development environment and easier prototyping. Highly recommended for "Vibe Coding" - a new paradigm of programming with AI assistance.',
    category: 'Development',
    status: 'Live',
    features: [
      'Rapid POC and MVP development',
      'Hosted development environment',
      'AI-assisted coding',
      'Easy prototyping workflow',
      'Deployment ready'
    ],
    tech: ['Replit', 'AI Agents', 'Cloud IDE', 'Deployment'],
    demoAvailable: true,
    comingSoon: false,
    link: 'https://replit.com',
    referral: true,
  },
  {
    id: 2,
    name: 'CURSOR',
    description: 'Popular AI coding assistant for experienced developers',
    longDescription: 'AI coding assistant that works on existing codebase with VSS plugin compatibility. More suitable for experienced coders and applicable for various coding scenarios.',
    category: 'Development',
    status: 'Live',
    features: [
      'Works on existing codebase',
      'VSS plugin compatibility',
      'Suitable for experienced coders',
      'Flexible coding scenarios',
      'AI code completion'
    ],
    tech: ['VS Code', 'AI Assistant', 'Code Completion', 'Plugins'],
    demoAvailable: true,
    comingSoon: false,
    link: 'https://cursor.sh',
  },
  {
    id: 3,
    name: 'ChatGPT ($20)',
    description: 'OpenAI\'s revolutionary Generative AI tool with multimodal advantages',
    longDescription: 'OpenAI\'s revolutionary Generative AI tool offering state-of-the-art LLM models with multimodal advantages. Some restrictions on medical inquiries but excellent for general AI tasks.',
    category: 'General AI',
    status: 'Live',
    features: [
      'State-of-the-art LLM models',
      'Multimodal capabilities',
      'Revolutionary AI assistance',
      'Wide range of applications',
      'Regular model updates'
    ],
    tech: ['GPT-4', 'Multimodal AI', 'OpenAI API', 'Web Interface'],
    demoAvailable: true,
    comingSoon: false,
    link: 'https://chatgpt.com/',
    pricing: '$20/month',
  },
  {
    id: 4,
    name: 'CLAUDE ($20)',
    description: 'Anthropic\'s AI assistant with advantages over ChatGPT for coding and medical analysis',
    longDescription: 'Anthropic\'s AI assistant offering less restrictive medical analysis and better performance for coding tasks. Some limitations include weaker OCR for images/PDFs and no image generator.',
    category: 'General AI',
    status: 'Live',
    features: [
      'Less restrictive medical analysis',
      'Better for coding tasks',
      'Strong reasoning capabilities',
      'Detailed explanations',
      'Safe AI alignment'
    ],
    tech: ['Claude AI', 'Anthropic', 'Constitutional AI', 'Web Interface'],
    demoAvailable: true,
    comingSoon: false,
    link: 'https://claude.ai/',
    pricing: '$20/month',
    limitations: ['Weaker OCR for images/PDFs', 'No image generator'],
  },
]

const categories = ['All', 'Development', 'General AI']

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
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
      
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
            Some AI tools that I have been utilizing in the past few years
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
                  {tool.link ? (
                    <a 
                      href={tool.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-ai-green to-ai-blue text-black font-medium rounded-lg hover:scale-105 transition-transform text-sm text-center"
                    >
                      {tool.referral ? 'Try (Referral)' : 'Visit Tool'}
                    </a>
                  ) : (
                    <button className="flex-1 px-4 py-2 glass border border-white/20 rounded-lg hover:border-ai-green/50 transition-all text-sm">
                      Learn More
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
                {selectedTool.link ? (
                  <a
                    href={selectedTool.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform"
                  >
                    {selectedTool.referral ? 'Try (Referral)' : 'Visit Tool'}
                  </a>
                ) : (
                  <button className="px-6 py-3 glass border border-white/20 rounded-full hover:border-ai-green/50 transition-all">
                    Learn More
                  </button>
                )}
                {selectedTool.pricing && (
                  <span className="px-6 py-3 text-ai-green font-medium">
                    {selectedTool.pricing}
                  </span>
                )}
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