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

        {/* Ghost Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mb-24">
          <Link href="/projects" className="block h-full">
            <GhostCard
              title="Selected Works"
              description="Generative AI pipelines and LLM architecture."
              delay={0.2}
              className="h-full"
            />
          </Link>
          <Link href="/thoughts" className="block h-full">
            <GhostCard
              title="Signal & Noise"
              description="Essays on the future of data engineering."
              delay={0.4}
              className="h-full"
            />
          </Link>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-center max-w-2xl mx-auto mb-24"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-light mb-6 text-[#EAEAEA]">
            Let's Build Something Amazing
          </h2>
          <p className="font-mono text-sm text-[#888888] mb-8 leading-relaxed">
            I'm always exploring new ideas and open to working on innovative AI projects.
            Whether you're looking for technical expertise, strategic guidance, or investment opportunities,
            let's collaborate to create the future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:amir.h.jalali@gmail.com"
              className="px-8 py-3 bg-[#EAEAEA] text-[#050505] font-mono text-xs uppercase tracking-widest font-bold rounded-full hover:bg-white transition-colors"
            >
              Get in Touch
            </a>
            <Link
              href="/resume"
              className="px-8 py-3 border border-white/10 text-[#EAEAEA] font-mono text-xs uppercase tracking-widest rounded-full hover:bg-white/5 hover:border-white/20 transition-all"
            >
              View Resume
            </Link>
          </div>
        </motion.div>

        {/* Minimalist Footer/Nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex justify-center gap-12 font-mono text-xs uppercase tracking-widest text-[#888888]"
        >
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