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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen container-padding pb-4">

        {/* Hero Section - Clear visual hierarchy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-center mb-2"
        >
          {/* Primary: Name */}
          <h1 className="text-hero mb-4">
            Amir H. Jalali
          </h1>

          {/* Secondary: Role - Supporting context using text-label */}
          <p className="text-label text-[#666666] mb-8">
            AI Strategy Consultant
          </p>

        </motion.div>

        {/* Bottom Navigation */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-2 text-label"
        >
          <Link href="/work" className="text-[#666666] hover:text-[#EAEAEA] transition-colors px-3">Work</Link>
          <span className="text-[#333333]">/</span>
          <Link href="/thoughts" className="text-[#666666] hover:text-[#EAEAEA] transition-colors px-3">Thoughts</Link>
          <span className="text-[#333333]">/</span>
          <Link href="/about" className="text-[#666666] hover:text-[#EAEAEA] transition-colors px-3">About</Link>
          <span className="text-[#333333]">/</span>
          <Link href="/contact" className="text-[#666666] hover:text-[#EAEAEA] transition-colors px-3">Contact</Link>
        </motion.nav>

      </div>
    </div>
  )
}
