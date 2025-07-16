'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const projects = [
  {
    id: 1,
    title: 'AI Content Generator',
    description: 'Automated article generation system using GPT-4 and DALL-E for multimedia content',
    tags: ['OpenAI', 'Next.js', 'TypeScript'],
    status: 'In Development',
    link: '#',
  },
  {
    id: 2,
    title: 'Voice-to-Article Pipeline',
    description: 'Convert voice recordings into fully formatted blog posts with AI-generated images',
    tags: ['Whisper API', 'NLP', 'Automation'],
    status: 'Planned',
    link: '#',
  },
  {
    id: 3,
    title: 'MR AI Portfolio',
    description: 'This AI-powered portfolio website with automated content generation',
    tags: ['Next.js', 'Framer Motion', 'Tailwind'],
    status: 'Live',
    link: '/',
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
    <div className="min-h-screen px-4 py-20 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-6xl font-space font-bold mb-4">
          <span className="text-gradient">AI Projects</span>
        </h1>
        <p className="text-xl text-gray-400">
          Exploring the intersection of AI and creativity
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {projects.map((project) => (
          <motion.div
            key={project.id}
            variants={item}
            whileHover={{ y: -5 }}
            className="glass p-6 rounded-xl border border-white/10 hover:border-ai-green/50 transition-all"
          >
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{project.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${
                project.status === 'Live' ? 'bg-ai-green/20 text-ai-green' :
                project.status === 'In Development' ? 'bg-ai-blue/20 text-ai-blue' :
                'bg-gray-500/20 text-gray-400'
              }`}>
                {project.status}
              </span>
            </div>
            
            <p className="text-gray-400 mb-4">
              {project.description}
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 bg-white/5 rounded-md"
                >
                  {tag}
                </span>
              ))}
            </div>
            
            <Link
              href={project.link}
              className="text-ai-green hover:text-ai-green/80 text-sm font-medium"
            >
              View Project →
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}