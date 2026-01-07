'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import ProjectSkeleton from '@/components/ProjectSkeleton'
import { Button } from '@/components/ui/button'
import FeaturedProjectCard from '@/components/FeaturedProjectCard'

// Helper to add basePath to image URLs
const getImageUrl = (url: string) => {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || ''
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
    longDescription: 'E-commerce / social media platform currently in stealth beta. Building the future of creator-led commerce where creators drop, fans shop, and moments turn into movements.',
    tags: ['E-commerce', 'Social Media', 'Startup', 'Creator Economy'],
    link: 'https://gabooja.com/',
    contact: 'amir@gabooja.com',
    image: getImageUrl('/images/projects/gabooja_noir.png'),
  },
  {
    id: 2,
    title: 'Avenu.AI',
    description: 'AI recruitment and onboarding platform with smart tools to reduce time and resources per hire',
    longDescription: 'AI recruitment and onboarding platform featuring smart AI recruitment tools designed to significantly reduce time and resources per hire by 230%.',
    tags: ['AI', 'Recruitment', 'HR Tech', 'Automation'],
    link: 'https://avenu.ai/',
    image: getImageUrl('/images/projects/avenu_noir.png'),
  },
  {
    id: 3,
    title: 'PLAICED',
    description: 'AI strategy implementation for advertising platform using LLMs and Generative AI',
    longDescription: 'AI strategy implementation for advertising platform leveraging LLMs and Generative AI for tailored advertisements and improved ROI.',
    tags: ['AI Strategy', 'LLMs', 'Advertising', 'ROI Optimization'],
    link: 'https://www.plaiced.com/',
    image: getImageUrl('/images/projects/plaiced_noir.png'),
  },
  {
    id: 4,
    title: 'ARGUMEND',
    description: 'Platform to improve online discourse quality using LLMs to add context and reduce false claims',
    longDescription: 'Platform designed to improve the quality of online discourse by using LLMs to add context and reduce the propagation of false claims.',
    tags: ['LLMs', 'Content Moderation', 'Fact Checking', 'Social Impact'],
    link: 'https://www.argumend.org/',
    image: getImageUrl('/images/projects/argumend_noir.png'),
  },
  {
    id: 5,
    title: 'CAMP ALBORZ',
    description: 'Group of friends, family, doers and dreamers worldwide',
    longDescription: 'A global community bringing together friends, family, doers and dreamers from around the world to collaborate and innovate.',
    tags: ['Community', 'Global Network', 'Collaboration', 'Innovation'],
    link: 'https://www.campalborz.org/',
    image: getImageUrl('/images/projects/camp_alborz_noir.png'),
  },
  {
    id: 6,
    title: 'MR AI Portfolio',
    description: 'This AI-powered portfolio website with modern design and AI article generation',
    longDescription: 'A sophisticated portfolio platform built with Next.js, featuring AI-powered content generation, modern animations, and seamless user experience.',
    tags: ['Next.js', 'AI Integration', 'Portfolio', 'Modern Design'],
    link: '/',
    image: getImageUrl('/images/projects/portfolio_noir.png'),
  },
]

export default function WorkPageClient() {
  const [featuredProject, ...otherProjects] = projects

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />

      <div className="relative z-10 section-padding container-padding max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-page-title mb-6">
            Work
          </h1>
        </motion.div>

        {/* Featured Project - Full Width */}
        <div className="mb-12">
          <FeaturedProjectCard project={featuredProject} />
        </div>

        {/* Other Projects Grid - 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid gap-8 grid-cols-1 md:grid-cols-2"
        >
          {otherProjects.map((project, index) => (
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
          <div className="card-border-emphasis p-8 md:p-12 max-w-4xl mx-auto bg-white/[0.02] backdrop-blur-md">
            <h2 className="text-section-title mb-4">
              Let's Build Something Amazing
            </h2>
            <p className="text-body-lg mb-8 max-w-2xl mx-auto">
              I'm always exploring new ideas and open to working on innovative AI projects.
              Whether you're looking for technical expertise, strategic guidance, or investment opportunities,
              let's collaborate to create the future.
            </p>
            <Button asChild size="lg" className="bg-white text-[#050505] hover:bg-[#EAEAEA] transition-colors font-mono uppercase tracking-widest">
              <Link href="/contact">
                Start a Conversation
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
