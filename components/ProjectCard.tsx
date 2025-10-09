'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ExternalLink, Mail, TrendingUp, Clock, Zap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import LazyImage from '@/components/LazyImage'

interface Project {
  id: number
  title: string
  description: string
  longDescription: string
  tags: string[]
  status: 'Live' | 'In Development' | 'Research' | 'Planning'
  progress: number
  link: string
  contact?: string
  image: string
}

interface ProjectCardProps {
  project: Project
  index: number
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Live':
        return { bg: 'bg-emerald-500/20', text: 'text-emerald-400', icon: Zap }
      case 'In Development':
        return { bg: 'bg-ai-blue/20', text: 'text-ai-blue', icon: TrendingUp }
      case 'Research':
        return { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: Clock }
      default:
        return { bg: 'bg-muted/20', text: 'text-muted-foreground', icon: Clock }
    }
  }

  const statusConfig = getStatusConfig(project.status)
  const StatusIcon = statusConfig.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group h-full"
    >
      <motion.div
        whileHover={{ 
          y: -5,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className="relative h-full"
      >
        <div className="relative h-full min-h-[500px] glass border border-border hover:border-ai-teal/30 dark:hover:border-ai-green/30 rounded-2xl p-6 transition-all duration-300 overflow-hidden flex flex-col">
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-ai-teal/5 via-transparent to-ai-cyan/5 dark:from-ai-green/5 dark:via-transparent dark:to-ai-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          {/* Floating orbs */}
          <div className="absolute top-4 right-4 w-20 h-20 bg-ai-teal/10 dark:bg-ai-green/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-ai-blue/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-200" />

          {/* Project Image */}
          <div className="relative -mx-6 -mt-6 mb-6 h-48 overflow-hidden rounded-t-2xl">
            <LazyImage
              src={project.image}
              alt={`${project.title} - ${project.description}`}
              className="w-full h-full object-cover"
              wrapperClassName="w-full h-full"
              aspectRatio="wide"
              placeholder="blur"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>

          {/* Header with status */}
          <div className="relative z-10 mb-6">
            <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {project.status}
            </Badge>
          </div>
          
          {/* Title with gradient effect on hover */}
          <motion.h3 
            className="text-2xl font-bold mb-4 relative z-10"
            whileHover={{ scale: 1.02 }}
          >
            <span className="group-hover:text-gradient transition-all duration-300">
              {project.title}
            </span>
          </motion.h3>
          
          {/* Description */}
          <p className="text-muted-foreground mb-6 leading-relaxed relative z-10 line-clamp-3 flex-grow">
            {project.description}
          </p>
          
          {/* Tags with hover effects */}
          <div className="flex flex-wrap gap-2 mb-6 relative z-10">
            {project.tags.slice(0, 3).map((tag, tagIndex) => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + tagIndex * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                className="text-xs px-3 py-1.5 bg-accent hover:bg-accent/80 rounded-full transition-all cursor-pointer"
              >
                {tag}
              </motion.span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-xs px-3 py-1.5 bg-muted/20 rounded-full text-muted-foreground">
                +{project.tags.length - 3} more
              </span>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex flex-col gap-3 relative z-10 mt-auto">
            <Button 
              asChild
              className="group/btn bg-gradient-to-r from-ai-teal to-ai-cyan dark:from-ai-green dark:to-ai-blue text-white font-medium hover:scale-105 transition-transform"
            >
              <Link
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                {project.status === 'Live' ? 'View Project' : 'Learn More'}
                <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </Button>
            
            {project.contact && (
              <Button 
                variant="outline" 
                size="sm" 
                asChild
              >
                <a href={`mailto:${project.contact}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Investment Opportunities
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-ai-teal/20 to-ai-cyan/20 dark:from-ai-green/20 dark:to-ai-blue/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
      </motion.div>
    </motion.div>
  )
}