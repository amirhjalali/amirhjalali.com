'use client'

import { motion } from 'framer-motion'
import GhostCard from '@/components/GhostCard'
import Spotlight from '@/components/Spotlight'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050505] text-[#EAEAEA]">
      {/* Background Effects */}
      <div className="noise-overlay" />
      <Spotlight />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-12">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-center mb-24"
        >
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-light tracking-tight mb-6 text-[#EAEAEA]">
            Amir H. Jalali
          </h1>
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-[#888888]">
            AI Consultant & Data Engineering Expert
          </p>
        </motion.div>

        {/* Ghost Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          <Link href="/projects" className="block">
            <GhostCard
              title="Selected Works"
              description="Generative AI pipelines and LLM architecture."
              delay={0.2}
            />
          </Link>
          <Link href="/thoughts" className="block">
            <GhostCard
              title="Signal & Noise"
              description="Essays on the future of data engineering."
              delay={0.4}
            />
          </Link>
        </div>

        {/* Minimalist Footer/Nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-0 right-0 flex justify-center gap-12 font-mono text-xs uppercase tracking-widest text-[#888888]"
        >
          <Link href="/contact" className="hover:text-[#EAEAEA] transition-colors">
            Contact
          </Link>
          <a href="https://github.com/amirhjalali" target="_blank" rel="noopener noreferrer" className="hover:text-[#EAEAEA] transition-colors">
            GitHub
          </a>
          <a href="https://linkedin.com/in/amirhjalali" target="_blank" rel="noopener noreferrer" className="hover:text-[#EAEAEA] transition-colors">
            LinkedIn
          </a>
        </motion.div>

      </div>
    </div>
  )
}