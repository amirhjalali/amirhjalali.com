'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ProjectSkeleton from '@/components/ProjectSkeleton'
import { Button } from '@/components/ui/button'

// Helper to add basePath to image URLs
const getImageUrl = (url: string) => {
  const basePath = process.env.NODE_ENV === 'production' ? '/amirhjalali.com' : ''
  return url.startsWith('/') ? `${basePath}${url}` : url
}

// Dynamic import for ProjectCard with loading state
const ProjectCard = dynamic(() => import('@/components/ProjectCard'), {
  loading: () => <ProjectSkeleton />,
  ssr: true
})

const projects = [
  {
    id: 1,
    title: 'GABOOJA!',
    description: 'E-commerce / social media platform currently in stealth beta',
    longDescription: 'E-commerce / social media platform currently in stealth beta. Seeking investors to join this exciting opportunity in the evolving digital commerce space.',
    tags: ['E-commerce', 'Social Media', 'Startup', 'Investment'],
    status: 'In Development' as const,
    progress: 70,
    link: 'https://gabooja.com/',
    contact: 'amir@gabooja.com',
    image: getImageUrl('/images/projects/47a93f37b854c4a561ed76f6a027e73d.jpg'),
  },
  {
    id: 2,
    title: 'Avenu.AI',
    description: 'AI recruitment and onboarding platform with smart tools to reduce time and resources per hire',
    longDescription: 'AI recruitment and onboarding platform featuring smart AI recruitment tools designed to significantly reduce time and resources per hire by 230%.',
    tags: ['AI', 'Recruitment', 'HR Tech', 'Automation'],
    status: 'Live' as const,
    progress: 90,
    link: 'https://avenu.ai/',
    image: getImageUrl('/images/projects/avenu-ai.jpg'),
  },
  {
    id: 3,
    title: 'PLAICED',
    description: 'AI strategy implementation for advertising platform using LLMs and Generative AI',
    longDescription: 'AI strategy implementation for advertising platform leveraging LLMs and Generative AI for tailored advertisements and improved ROI.',
    tags: ['AI Strategy', 'LLMs', 'Advertising', 'ROI Optimization'],
    status: 'Live' as const,
    progress: 85,
    link: 'https://www.getplaiced.com/',
    image: getImageUrl('/images/projects/plaiced-optimized.jpg'),
  },
  {
    id: 4,
    title: 'ARGUMEND',
    description: 'Platform to improve online discourse quality using LLMs to add context and reduce false claims',
    longDescription: 'Platform designed to improve the quality of online discourse by using LLMs to add context and reduce the propagation of false claims.',
    tags: ['LLMs', 'Content Moderation', 'Fact Checking', 'Social Impact'],
    status: 'Live' as const,
    progress: 80,
    link: 'https://www.argumend.org/',
    image: getImageUrl('/images/projects/argumend.jpg'),
  },
  {
    id: 5,
    title: 'CAMP ALBORZ',
    description: 'Group of friends, family, doers and dreamers worldwide',
    longDescription: 'A global community bringing together friends, family, doers and dreamers from around the world to collaborate and innovate.',
    tags: ['Community', 'Global Network', 'Collaboration', 'Innovation'],
    status: 'Live' as const,
    progress: 95,
    link: 'https://www.campalborz.org/',
    image: getImageUrl('/images/projects/697708edbb82e14a4a127560ef91f02e.jpg'),
  },
  {
    id: 6,
    title: 'MR AI Portfolio',
    description: 'This AI-powered portfolio website with modern design and AI article generation',
    longDescription: 'A sophisticated portfolio platform built with Next.js, featuring AI-powered content generation, modern animations, and seamless user experience.',
    tags: ['Next.js', 'AI Integration', 'Portfolio', 'Modern Design'],
    status: 'Live' as const,
    progress: 95,
    link: '/',
    image: getImageUrl('/images/projects/122a7dde94334fc9d7a4bfac0020dcf4.jpg'),
  },
]

export default function ProjectsPage() {

  return (
    <div className="min-h-screen relative">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
      
      
      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-space mb-6">
            <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Exploring the intersection of AI, technology, and innovation through impactful projects
          </p>
        </motion.div>

        {/* Projects Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-8 grid-cols-1 md:grid-cols-2 xl:grid-cols-3"
        >
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} />
          ))}
        </motion.div>

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-20"
        >
          <div className="glass border border-border rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl mb-4">
              <span className="text-gradient">Let's Build Something Amazing</span>
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg">
              I'm always exploring new ideas and open to working on innovative AI projects. 
              Whether you're looking for technical expertise, strategic guidance, or investment opportunities,
              let's collaborate to create the future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-ai-teal to-ai-cyan dark:from-ai-green dark:to-ai-blue text-white hover:scale-105 transition-transform">
                <Link href="/contact">
                  Get in Touch
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/resume">
                  View Resume
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}