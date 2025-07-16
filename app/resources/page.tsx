'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const resources = [
  {
    id: 1,
    name: 'Fast AI',
    description: 'Some great resources for coders',
    longDescription: 'Fast.ai provides practical neural networks and AI education resources designed for coders who want to get started with machine learning and deep learning quickly.',
    category: 'Education',
    type: 'Course Platform',
    url: 'https://fast.ai/',
    features: [
      'Practical AI education',
      'Coder-friendly approach',
      'Neural networks focus',
      'Hands-on learning',
      'Free courses available'
    ],
    tags: ['AI Education', 'Neural Networks', 'Practical Learning', 'Free'],
    difficulty: 'Beginner to Advanced',
    recommended: true,
  },
  {
    id: 2,
    name: 'Ilya Sutskever Reading List',
    description: 'A collection of great papers and articles attributed to Ilya Sutskever, former head of research at OpenAI',
    longDescription: 'A curated collection of research papers and articles from Ilya Sutskever, the former head of research at OpenAI. This reading list provides deep insights into the foundations of modern AI and machine learning.',
    category: 'Research',
    type: 'Paper Collection',
    url: '#', // Note: Original site didn't provide direct link
    features: [
      'Research papers collection',
      'OpenAI insights',
      'Academic foundations',
      'Deep learning focus',
      'Expert curation'
    ],
    tags: ['Research Papers', 'OpenAI', 'Deep Learning', 'Academic'],
    difficulty: 'Advanced',
    recommended: true,
  },
]

const categories = ['All', 'Education', 'Research', 'Tools', 'Documentation']

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

export default function ResourcesPage() {
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
            <span className="text-gradient">Resources</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Useful and practical resources I've found for learning practical AI skills
          </p>
        </motion.div>

        {/* Resources Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
        >
          {resources.map((resource) => (
            <motion.div
              key={resource.id}
              variants={item}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="glass p-8 rounded-2xl border border-white/10 hover:border-ai-green/30 transition-all duration-300 h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-xs px-3 py-1.5 rounded-full bg-ai-green/20 text-ai-green">
                      {resource.category}
                    </span>
                    {resource.recommended && (
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs text-yellow-400">Recommended</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-400">
                    {resource.type}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold mb-4 group-hover:text-gradient transition-all">
                  {resource.name}
                </h3>

                {/* Description */}
                <p className="text-gray-300 mb-2 font-medium">
                  {resource.description}
                </p>
                
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {resource.longDescription}
                </p>

                {/* Features */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold mb-3 text-ai-green">Key Features</h4>
                  <ul className="space-y-2">
                    {resource.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                        <div className="w-1.5 h-1.5 bg-ai-green rounded-full mt-2 flex-shrink-0"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {resource.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Difficulty */}
                <div className="mb-6">
                  <span className="text-xs text-gray-500">Difficulty: </span>
                  <span className="text-sm text-ai-blue font-medium">{resource.difficulty}</span>
                </div>

                {/* Action */}
                <div className="flex gap-3">
                  {resource.url !== '#' ? (
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform text-center"
                    >
                      Visit Resource
                    </a>
                  ) : (
                    <span className="flex-1 px-6 py-3 glass border border-white/20 rounded-full text-center text-gray-400">
                      Link Coming Soon
                    </span>
                  )}
                </div>
              </div>
              
              {/* Glow effect on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-ai-green/20 to-ai-blue/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </motion.div>
          ))}
        </motion.div>

        {/* Additional Resources Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold mb-8">More Learning Paths</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass p-6 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold mb-3 text-ai-green">Beginner Track</h3>
              <p className="text-gray-400 text-sm mb-4">
                Start with foundational concepts and practical applications
              </p>
              <div className="space-y-2 text-sm">
                <div className="text-gray-300">• Python Programming</div>
                <div className="text-gray-300">• Basic ML Concepts</div>
                <div className="text-gray-300">• Data Manipulation</div>
              </div>
            </div>
            
            <div className="glass p-6 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold mb-3 text-ai-blue">Intermediate Track</h3>
              <p className="text-gray-400 text-sm mb-4">
                Dive deeper into neural networks and specialized topics
              </p>
              <div className="space-y-2 text-sm">
                <div className="text-gray-300">• Deep Learning</div>
                <div className="text-gray-300">• Computer Vision</div>
                <div className="text-gray-300">• NLP Fundamentals</div>
              </div>
            </div>
            
            <div className="glass p-6 rounded-xl border border-white/10">
              <h3 className="text-lg font-semibold mb-3 text-purple-400">Advanced Track</h3>
              <p className="text-gray-400 text-sm mb-4">
                Research-level topics and cutting-edge developments
              </p>
              <div className="space-y-2 text-sm">
                <div className="text-gray-300">• Research Papers</div>
                <div className="text-gray-300">• LLM Architecture</div>
                <div className="text-gray-300">• AI Safety</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="glass p-8 rounded-2xl border border-white/10 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Need Personalized Guidance?</h3>
            <p className="text-gray-400 mb-6">
              Looking for specific resources or have questions about AI learning paths? I'm here to help guide your learning journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="px-6 py-3 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform inline-block text-center"
              >
                Get Learning Guidance
              </Link>
              <Link
                href="/ai-tools"
                className="px-6 py-3 glass border border-white/20 rounded-full hover:border-ai-green/50 transition-all inline-block text-center"
              >
                Explore AI Tools
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}