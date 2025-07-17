'use client'

import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
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
  const [isFlipped, setIsFlipped] = useState(false)
  
  // 3D tilt effect
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]))
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]))

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    x.set((event.clientX - centerX) / rect.width)
    y.set((event.clientY - centerY) / rect.height)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

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
      className="group perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        whileHover={{ 
          scale: 1.02,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className="relative h-full cursor-pointer focus-visible"
        onClick={() => setIsFlipped(!isFlipped)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setIsFlipped(!isFlipped)
          }
        }}
        tabIndex={0}
        role="button"
        aria-label={`${project.title} project card. Press Enter to ${isFlipped ? 'show front' : 'flip for details'}`}
        aria-expanded={isFlipped}
      >
        <motion.div
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="relative w-full h-full preserve-3d"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front Face */}
          <div className="absolute w-full h-full backface-hidden">
            <div className="relative h-full glass border border-border hover:border-ai-green/30 rounded-2xl p-6 transition-all duration-300 overflow-hidden">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-ai-green/5 via-transparent to-ai-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Floating orbs */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-ai-green/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute bottom-4 left-4 w-16 h-16 bg-ai-blue/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000 delay-200" />

              {/* Project Image */}
              <div className="relative -mx-6 -mt-6 mb-6 h-48 overflow-hidden">
                <LazyImage
                  src={project.image}
                  alt={project.title}
                  className="w-full h-full object-cover"
                  wrapperClassName="w-full h-full"
                  aspectRatio="wide"
                  placeholder="blur"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
              </div>

              {/* Header with status and progress */}
              <div className="relative z-10 flex justify-between items-start mb-6">
                <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {project.status}
                </Badge>
                
                <div className="text-right">
                  <div className="text-xs text-muted-foreground mb-1">Progress</div>
                  <div className="w-16 h-2 bg-border rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-ai-green to-ai-blue rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ delay: index * 0.1 + 0.5, duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{project.progress}%</div>
                </div>
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
              <p className="text-muted-foreground mb-6 leading-relaxed relative z-10 line-clamp-3">
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
              <div className="flex flex-col gap-3 relative z-10">
                <Button 
                  asChild
                  className="group/btn bg-gradient-to-r from-ai-green to-ai-blue text-black hover:from-ai-blue hover:to-ai-green font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Link href={project.link}>
                    {project.status === 'Live' ? 'View Project' : 'Learn More'}
                    <ExternalLink className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                
                {project.contact && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <a href={`mailto:${project.contact}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Investment Opportunities
                    </a>
                  </Button>
                )}
              </div>

              {/* Click hint */}
              <div className="absolute bottom-4 right-4 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                Click to flip
              </div>
            </div>
          </div>

          {/* Back Face */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180">
            <div className="h-full glass border border-border rounded-2xl p-6 bg-gradient-to-br from-ai-green/10 via-background to-ai-blue/10">
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gradient">{project.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsFlipped(false)
                    }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-semibold mb-3 text-ai-green">Project Details</h4>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {project.longDescription}
                  </p>
                  
                  <h4 className="font-semibold mb-3 text-ai-blue">Technologies</h4>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {project.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Status</div>
                      <div className={`font-medium ${statusConfig.text}`}>{project.status}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Progress</div>
                      <div className="font-medium">{project.progress}%</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button 
                    asChild 
                    size="sm" 
                    className="flex-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link href={project.link}>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Visit
                    </Link>
                  </Button>
                  {project.contact && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      onClick={(e) => e.stopPropagation()}
                    >
                      <a href={`mailto:${project.contact}`}>
                        <Mail className="w-4 h-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Glow effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-ai-green/20 to-ai-blue/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
      </motion.div>
    </motion.div>
  )
}