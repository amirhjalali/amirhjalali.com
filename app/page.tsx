'use client'

import { motion } from 'framer-motion'
import Spotlight from '@/components/Spotlight'
import PortraitReveal from '@/components/PortraitReveal'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050505] text-[#EAEAEA] -mt-20">
      {/* Background Effects */}
      <div className="noise-overlay" />
      <Spotlight />
      <PortraitReveal />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pb-4">

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-center mb-2"
        >
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl 2xl:text-9xl font-light tracking-tight mb-3 text-[#EAEAEA]">
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] font-normal">A</span>mir H. Jalal<span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] font-normal">i</span>
          </h1>
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-[#888888]">
            Human Consultant
          </p>
        </motion.div>

        {/* Minimalist Nav */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="absolute bottom-3 left-0 right-0 z-50 flex justify-center gap-12 font-mono text-xs uppercase tracking-widest text-[#888888]"
        >
          <Link href="/work" className="hover:text-[#EAEAEA] transition-colors">
            Work
          </Link>
          <Link href="/thoughts" className="hover:text-[#EAEAEA] transition-colors">
            Thoughts
          </Link>
          <Link href="/about" className="hover:text-[#EAEAEA] transition-colors">
            About
          </Link>
        </motion.div>

      </div>
    </div>
  )
}