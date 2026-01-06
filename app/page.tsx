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

          {/* Primary descriptor */}
          <p className="font-mono text-xs md:text-sm uppercase tracking-[0.2em] text-[#888888] mb-6">
            Human Consultant
          </p>

          {/* Value proposition */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1.2 }}
            className="font-sans text-lg md:text-xl text-[#666666] max-w-md mx-auto leading-relaxed"
          >
            Turning AI ambition into business reality.
            <br />
            <span className="text-[#888888]">14 years of making data work.</span>
          </motion.p>
        </motion.div>

        {/* Enhanced Navigation with Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-0 right-0 z-50"
        >
          {/* Scroll indicator */}
          <motion.div
            className="flex justify-center mb-6"
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <div className="w-px h-8 bg-gradient-to-b from-transparent via-[#444444] to-transparent" />
          </motion.div>

          {/* Nav links with underline hover effect */}
          <div className="flex justify-center gap-8 sm:gap-16 font-mono text-xs uppercase tracking-widest">
            <Link href="/work" className="group flex flex-col items-center gap-2">
              <span className="text-[#888888] group-hover:text-[#EAEAEA] transition-colors duration-300">Work</span>
              <span className="w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/thoughts" className="group flex flex-col items-center gap-2">
              <span className="text-[#888888] group-hover:text-[#EAEAEA] transition-colors duration-300">Thoughts</span>
              <span className="w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </Link>
            <Link href="/about" className="group flex flex-col items-center gap-2">
              <span className="text-[#888888] group-hover:text-[#EAEAEA] transition-colors duration-300">About</span>
              <span className="w-0 h-px bg-white group-hover:w-full transition-all duration-300" />
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
