'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
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
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -4 }}
      className="group relative h-full"
    >
      <Link href={project.link} target="_blank" className="block h-full">
        <div className="relative border border-white/10 rounded-xl overflow-hidden bg-transparent hover:bg-white/5 transition-all duration-500 h-full flex flex-col backdrop-blur-md">

          <div className="relative h-48 overflow-hidden border-b border-white/5">
            <LazyImage
              src={project.image}
              alt={project.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80 group-hover:opacity-100"
              wrapperClassName="w-full h-full"
              aspectRatio="wide"
              placeholder="skeleton"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />

            {/* Status Badge Overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2 px-2 py-1 bg-black/50 border border-white/10 rounded-full text-[10px] font-mono uppercase tracking-widest text-white backdrop-blur-sm">
              <div className={`w-1.5 h-1.5 rounded-full ${project.status === 'Live' ? 'bg-emerald-400' :
                  project.status === 'In Development' ? 'bg-blue-400' : 'bg-purple-400'
                }`} />
              {project.status}
            </div>
          </div>

          <div className="p-6 flex flex-col flex-grow">
            <div className="flex justify-between items-start mb-3 text-[10px] font-mono uppercase tracking-widest text-[#888888]">
              <span>Project</span>
              <span>{project.progress}% Complete</span>
            </div>

            <h3 className="text-xl mb-3 font-serif font-light text-[#EAEAEA] group-hover:text-white transition-colors duration-300 line-clamp-2">
              {project.title}
            </h3>

            <p className="text-[#888888] text-sm line-clamp-3 mb-4 flex-grow font-sans font-light">
              {project.description}
            </p>

            <div className="flex flex-wrap gap-2 mb-4">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-2 py-1 border border-white/10 rounded-full font-mono uppercase tracking-widest text-[#888888] group-hover:border-white/20 group-hover:text-[#EAEAEA] transition-all"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-[#888888]">
              <span>View Project</span>
              <span className="text-[#EAEAEA] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                →
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}