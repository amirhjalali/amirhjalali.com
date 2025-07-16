'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const projects = [
  {
    id: 1,
    title: 'AI Content Generator',
    description: 'Automated article generation system using GPT-4 and DALL-E for multimedia content creation with voice-to-text integration.',
    longDescription: 'A comprehensive content creation pipeline that transforms voice memos into fully formatted articles with AI-generated images, SEO optimization, and automated publishing.',
    tags: ['OpenAI', 'Next.js', 'TypeScript', 'Whisper API'],
    status: 'In Development',
    progress: 75,
    link: '#',
    image: '/api/placeholder/400/300',
  },
  {
    id: 2,
    title: 'Voice-to-Article Pipeline',
    description: 'Convert voice recordings into fully formatted blog posts with AI-generated images and automated SEO optimization.',
    longDescription: 'Revolutionary workflow that takes raw voice recordings and produces publication-ready articles with multimedia content, metadata, and distribution.',
    tags: ['Whisper API', 'NLP', 'Automation', 'DALL-E'],
    status: 'Planned',
    progress: 25,
    link: '#',
    image: '/api/placeholder/400/300',
  },
  {
    id: 3,
    title: 'MR AI Portfolio',
    description: 'This AI-powered portfolio website with animated components, modern design, and dynamic content generation.',
    longDescription: 'A sophisticated portfolio platform built with Next.js, featuring real-time animations, AI-powered content, and seamless user experience.',
    tags: ['Next.js', 'Framer Motion', 'Tailwind', 'TypeScript'],
    status: 'Live',
    progress: 90,
    link: '/',
    image: '/api/placeholder/400/300',
  },
  {
    id: 4,
    title: 'Neural Style Transfer',
    description: 'Real-time artistic style transfer using neural networks for creative visual content generation.',
    longDescription: 'Advanced computer vision project implementing style transfer algorithms for real-time artistic transformations of images and video.',
    tags: ['TensorFlow', 'Computer Vision', 'Python', 'WebGL'],
    status: 'Research',
    progress: 40,
    link: '#',
    image: '/api/placeholder/400/300',
  },
]

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

export default function ProjectsPage() {
  return (
    <div className="min-h-screen relative">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
      
      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <h1 className="text-5xl md:text-7xl font-space font-black mb-6">
            <span className="text-gradient">AI Projects</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Exploring the intersection of artificial intelligence and creativity through innovative research and development
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              variants={item}
              whileHover={{ y: -5 }}
              className="group relative"
            >
              <div className="glass p-8 rounded-2xl border border-white/10 hover:border-ai-green/30 transition-all duration-300 h-full">
                {/* Status and Progress */}
                <div className="flex justify-between items-start mb-6">
                  <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                    project.status === 'Live' ? 'bg-ai-green/20 text-ai-green' :
                    project.status === 'In Development' ? 'bg-ai-blue/20 text-ai-blue' :
                    project.status === 'Research' ? 'bg-purple-500/20 text-purple-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {project.status}
                  </span>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">Progress</div>
                    <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-ai-green to-ai-blue rounded-full transition-all duration-1000"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold mb-4 group-hover:text-gradient transition-all">
                  {project.title}
                </h3>
                
                <p className="text-gray-400 mb-6 leading-relaxed">
                  {project.longDescription}
                </p>
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {project.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                {/* Action */}
                <Link
                  href={project.link}
                  className="inline-flex items-center gap-2 text-ai-green hover:text-ai-green/80 font-medium transition-colors group-hover:gap-3"
                >
                  {project.status === 'Live' ? 'View Project' : 'Learn More'}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
              
              {/* Glow effect on hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-ai-green/20 to-ai-blue/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </motion.div>
          ))}
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-20"
        >
          <h3 className="text-2xl font-bold mb-4">Interested in collaboration?</h3>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            I'm always exploring new ideas and open to working on innovative AI projects. 
            Let's build something amazing together.
          </p>
          <Link
            href="/contact"
            className="inline-flex px-8 py-4 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform"
          >
            Get in Touch
          </Link>
        </motion.div>
      </div>
    </div>
  )
}