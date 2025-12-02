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
          className="text-center mb-12"
        >
          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-light tracking-tight mb-6 text-[#EAEAEA]">
            Amir H. Jalali
          </h1>
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-[#888888]">
            AI Consultant & Data Engineering Expert
          </p>
        </motion.div>

        {/* Minimalist Nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="flex flex-col items-center gap-8 font-mono text-xs uppercase tracking-widest text-[#888888]"
        >
          <div className="flex gap-12">
            <Link href="/projects" className="hover:text-[#EAEAEA] transition-colors">
              Works
            </Link>
            <Link href="/thoughts" className="hover:text-[#EAEAEA] transition-colors">
              Thoughts
            </Link>
            <Link href="/resume" className="hover:text-[#EAEAEA] transition-colors">
              Resume
            </Link>
          </div>

          <div className="flex gap-12 opacity-50">
            <a href="https://github.com/amirhjalali" target="_blank" rel="noopener noreferrer" className="hover:text-[#EAEAEA] transition-colors">
              GitHub
            </a>
            <a href="https://linkedin.com/in/amirhjalali" target="_blank" rel="noopener noreferrer" className="hover:text-[#EAEAEA] transition-colors">
              LinkedIn
            </a>
          </div>
        </motion.div>

      </div>
    </div>
  )
}