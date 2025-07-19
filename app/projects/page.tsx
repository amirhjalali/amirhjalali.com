'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import dynamic from 'next/dynamic'
import ProjectSkeleton from '@/components/ProjectSkeleton'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Filter, Grid, List, Sparkles } from 'lucide-react'

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
    image: '/images/projects/47a93f37b854c4a561ed76f6a027e73d.jpg',
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
    image: 'https://avenu.ai/wp-content/uploads/2023/06/avenu-featured-image-1.jpg',
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
    image: 'https://www.getplaiced.com/og-image.jpg',
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
    image: '/images/ai-tools/42bb6faf6ae907625e09db4798f39158.jpg',
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
    image: '/images/projects/697708edbb82e14a4a127560ef91f02e.jpg',
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
    image: '/images/projects/122a7dde94334fc9d7a4bfac0020dcf4.jpg',
  },
]

const categories = ['All', 'Live', 'In Development', 'AI Projects', 'Platforms']

export default function ProjectsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isLoading, setIsLoading] = useState(false)

  const filteredProjects = selectedCategory === 'All' 
    ? projects 
    : selectedCategory === 'AI Projects'
    ? projects.filter(project => project.tags.some(tag => tag.toLowerCase().includes('ai')))
    : selectedCategory === 'Platforms'
    ? projects.filter(project => project.tags.some(tag => ['Platform', 'E-commerce', 'Social Media'].includes(tag)))
    : projects.filter(project => project.status === selectedCategory)

  const handleCategoryChange = (category: string) => {
    setIsLoading(true)
    setSelectedCategory(category)
    // Simulate loading for smooth transition
    setTimeout(() => setIsLoading(false), 500)
  }

  return (
    <div className="min-h-screen relative">
      {/* Enhanced background effects */}
      <div className="absolute inset-0 mesh-gradient opacity-30" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMDUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-ai-green rounded-full animate-pulse" />
      <div className="absolute top-40 right-20 w-1 h-1 bg-ai-blue rounded-full animate-pulse delay-1000" />
      <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-ai-green rounded-full animate-pulse delay-2000" />
      
      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ai-green/20 to-ai-blue/20 rounded-full text-sm font-medium mb-6"
          >
            <Sparkles className="w-4 h-4 text-ai-green" />
            Portfolio Showcase
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl font-space font-black mb-6">
            <span className="text-gradient">Projects</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Exploring the intersection of AI, technology, and innovation through impactful projects
          </p>
        </motion.div>

        {/* Filters and View Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12"
        >
          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={handleCategoryChange} className="w-full md:w-auto">
            <TabsList className="grid grid-cols-3 md:grid-cols-5 w-full md:w-auto">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="text-xs md:text-sm"
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>

        {/* Projects Grid */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <ProjectSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`grid gap-6 md:gap-8 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' 
                  : 'grid-cols-1'
              }`}
            >
              {filteredProjects.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* No results message */}
        {!isLoading && filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-6">Try selecting a different category</p>
            <Button onClick={() => handleCategoryChange('All')}>
              View All Projects
            </Button>
          </motion.div>
        )}

        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-20"
        >
          <div className="glass border border-border rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">
              <span className="text-gradient">Let's Build Something Amazing</span>
            </h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto text-lg leading-relaxed">
              I'm always exploring new ideas and open to working on innovative AI projects. 
              Whether you're looking for technical expertise, strategic guidance, or investment opportunities,
              let's collaborate to create the future.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-gradient-to-r from-ai-green to-ai-blue text-black hover:from-ai-blue hover:to-ai-green">
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