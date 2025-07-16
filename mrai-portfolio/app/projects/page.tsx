'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

const projects = [
  {
    id: 1,
    title: 'GABOOJA!',
    description: 'E-commerce / social media platform currently in stealth beta',
    longDescription: 'E-commerce / social media platform currently in stealth beta. Seeking investors to join this exciting opportunity in the evolving digital commerce space.',
    tags: ['E-commerce', 'Social Media', 'Startup', 'Investment'],
    status: 'In Development',
    progress: 70,
    link: 'https://gabooja.com/',
    contact: 'amir@gabooja.com',
    image: '/api/placeholder/400/300',
  },
  {
    id: 2,
    title: 'Avenu.AI',
    description: 'AI recruitment and onboarding platform with smart tools to reduce time and resources per hire',
    longDescription: 'AI recruitment and onboarding platform featuring smart AI recruitment tools designed to significantly reduce time and resources per hire by 230%.',
    tags: ['AI', 'Recruitment', 'HR Tech', 'Automation'],
    status: 'Live',
    progress: 90,
    link: 'https://avenu.ai/',
    image: '/api/placeholder/400/300',
  },
  {
    id: 3,
    title: 'PLAICED',
    description: 'AI strategy implementation for advertising platform using LLMs and Generative AI',
    longDescription: 'AI strategy implementation for advertising platform leveraging LLMs and Generative AI for tailored advertisements and improved ROI.',
    tags: ['AI Strategy', 'LLMs', 'Advertising', 'ROI Optimization'],
    status: 'Live',
    progress: 85,
    link: 'https://www.getplaiced.com/',
    image: '/api/placeholder/400/300',
  },
  {
    id: 4,
    title: 'ARGUMEND',
    description: 'Platform to improve online discourse quality using LLMs to add context and reduce false claims',
    longDescription: 'Platform designed to improve the quality of online discourse by using LLMs to add context and reduce the propagation of false claims.',
    tags: ['LLMs', 'Content Moderation', 'Fact Checking', 'Social Impact'],
    status: 'Live',
    progress: 80,
    link: 'https://www.argumend.org/',
    image: '/api/placeholder/400/300',
  },
  {
    id: 5,
    title: 'CAMP ALBORZ',
    description: 'Group of friends, family, doers and dreamers worldwide',
    longDescription: 'A global community bringing together friends, family, doers and dreamers from around the world to collaborate and innovate.',
    tags: ['Community', 'Global Network', 'Collaboration', 'Innovation'],
    status: 'Live',
    progress: 95,
    link: 'https://www.campalborz.org/',
    image: '/api/placeholder/400/300',
  },
  {
    id: 6,
    title: 'MR AI Portfolio',
    description: 'This AI-powered portfolio website with modern design and AI article generation',
    longDescription: 'A sophisticated portfolio platform built with Next.js, featuring AI-powered content generation, modern animations, and seamless user experience.',
    tags: ['Next.js', 'AI Integration', 'Portfolio', 'Modern Design'],
    status: 'Live',
    progress: 95,
    link: '/',
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
            <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Some recent projects and ideas I am involved with
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
                <div className="flex flex-col gap-3">
                  <Link
                    href={project.link}
                    className="inline-flex items-center gap-2 text-ai-green hover:text-ai-green/80 font-medium transition-colors group-hover:gap-3"
                  >
                    {project.status === 'Live' ? 'View Project' : 'Learn More'}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  {project.contact && (
                    <p className="text-sm text-gray-500">
                      Investment opportunities: <a href={`mailto:${project.contact}`} className="text-ai-blue hover:text-ai-blue/80 transition-colors">{project.contact}</a>
                    </p>
                  )}
                </div>
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