'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'

// Dynamic import for non-critical visual effects
const PortraitReveal = dynamic(() => import('@/components/PortraitReveal'), {
  ssr: false,
  loading: () => null
})

export default function HomePageClient() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#050505] text-[#EAEAEA] -mt-20">
      {/* Background Effects */}
      <div className="noise-overlay" />
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
            <span className="text-[#EAEAEA]">A</span>
            <span className="text-[#666666]">mir H. Jalal</span>
            <span className="text-[#EAEAEA]">i</span>
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
          className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-1 text-label"
        >
          <Link href="/work" className="text-[#666666] hover:text-[#EAEAEA] hover:tracking-[0.2em] transition-[letter-spacing,color] duration-300 px-4 py-2">Work</Link>
          <span className="text-[#333333] select-none">/</span>
          <Link href="/thoughts" className="text-[#666666] hover:text-[#EAEAEA] hover:tracking-[0.2em] transition-[letter-spacing,color] duration-300 px-4 py-2">Thoughts</Link>
          <span className="text-[#333333] select-none">/</span>
          <Link href="/about" className="text-[#666666] hover:text-[#EAEAEA] hover:tracking-[0.2em] transition-[letter-spacing,color] duration-300 px-4 py-2">About</Link>
          <span className="text-[#333333] select-none">/</span>
          <Link href="/mrai" className="text-[#666666] hover:text-[#EAEAEA] hover:tracking-[0.2em] transition-[letter-spacing,color] duration-300 px-4 py-2">MrAI</Link>
        </motion.nav>

      </div>
    </div>
  )
}
