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
        <article className="relative grid md:grid-cols-2 gap-0 border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_40px_rgba(255,255,255,0.03)]">
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
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666] mb-4 block">
                Featured Project
              </span>

              <h2 className="text-3xl md:text-4xl font-serif font-light mb-4 text-[#EAEAEA] group-hover:text-white transition-colors">
                {project.title}
              </h2>

              <p className="text-[#888888] text-lg mb-6 leading-relaxed">
                {project.longDescription}
              </p>

              <div className="flex flex-wrap gap-2 mb-6">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] px-3 py-1.5 border border-white/10 rounded-full font-mono uppercase tracking-widest text-[#888888] group-hover:border-white/20 group-hover:text-[#EAEAEA] transition-all"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 text-[#888888] group-hover:text-white transition-colors">
                <span className="text-sm font-mono uppercase tracking-widest">View Project</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </motion.div>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}
