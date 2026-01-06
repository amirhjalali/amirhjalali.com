'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import LazyImage from '@/components/LazyImage'
import { ArrowUpRight } from 'lucide-react'

interface Project {
  id: number
  title: string
  description: string
  longDescription: string
  tags: string[]
  link: string
  contact?: string
  image: string
}

interface FeaturedProjectCardProps {
  project: Project
}

export default function FeaturedProjectCard({ project }: FeaturedProjectCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      className="group"
    >
      <Link
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View featured project: ${project.title}`}
        className="block"
      >
        {/* Enhanced featured card with emphasis border and larger presence */}
        <article className="relative grid md:grid-cols-[1.2fr,1fr] gap-0 card-border-emphasis overflow-hidden bg-white/[0.03] hover:bg-white/[0.05] transition-all duration-500 hover:border-white/30 hover:shadow-[0_0_60px_rgba(255,255,255,0.04)] min-h-[400px] md:min-h-[500px]">
          {/* Featured Badge */}
          <div className="absolute top-6 left-6 z-10">
            <span className="text-micro px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
              Featured Project
            </span>
          </div>

          {/* Image Section */}
          <div className="relative aspect-[16/10] md:aspect-auto overflow-hidden">
            <LazyImage
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              wrapperClassName="w-full h-full"
              aspectRatio="wide"
              placeholder="skeleton"
            />
            {/* Gradient overlay for text readability on mobile */}
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#050505]/80 via-transparent to-transparent md:from-transparent md:via-transparent md:to-[#050505]/60" />
          </div>

          {/* Content Section */}
          <div className="p-8 md:p-12 flex flex-col justify-center relative">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              {/* Title - noticeably larger using text-section-title */}
              <h2 className="text-section-title mb-4 group-hover:text-white transition-colors">
                {project.title}
              </h2>

              <p className="text-body-lg mb-6 leading-relaxed">
                {project.longDescription}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-micro px-3 py-1.5 border border-white/10 rounded-full text-[#888888] group-hover:border-white/20 group-hover:text-[#EAEAEA] transition-all"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-label text-[#888888] group-hover:text-white transition-colors">
                <span>View Project</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </motion.div>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}
