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

interface ProjectCardProps {
  project: Project
  index: number
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 }
}

export default function ProjectCard({ project, index }: ProjectCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="show"
      transition={{ delay: index * 0.1, duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative h-full"
    >
      <Link
        href={project.link}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View project: ${project.title}`}
        className="block h-full"
      >
        <article className="relative border border-white/10 rounded-xl overflow-hidden bg-transparent hover:bg-white/[0.03] transition-[background,border-color,box-shadow] duration-500 h-full flex flex-col backdrop-blur-md hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)]">

          <div className="relative h-48 overflow-hidden border-b border-white/5">
            <LazyImage
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100"
              wrapperClassName="w-full h-full"
              aspectRatio="wide"
              placeholder="skeleton"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 to-transparent" />
          </div>

          <motion.div
            className="p-6 flex flex-col flex-grow"
            initial={{ y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start mb-3 text-[10px] font-mono uppercase tracking-widest text-[#666666]">
              <span>Project</span>
            </div>

            <h3 className="text-xl mb-3 font-serif font-light text-[#EAEAEA] group-hover:text-white transition-colors duration-300 line-clamp-2">
              {project.title}
            </h3>

            <p className="text-[#888888] text-sm line-clamp-3 mb-4 flex-grow font-sans">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-1 border border-white/10 rounded-full font-mono uppercase tracking-widest text-[#888888] group-hover:border-white/20 group-hover:text-[#EAEAEA] transition-[border-color,color]"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-[#888888]">
              <span>View Project</span>
              <ArrowUpRight className="w-4 h-4 text-[#888888] group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-[color,transform] duration-300" />
            </div>
          </motion.div>
        </article>
      </Link>
    </motion.div>
  )
}
