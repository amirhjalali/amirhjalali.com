'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, BookOpen } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] relative flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background effects */}
      <div className="noise-overlay" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/5 via-[#050505] to-[#050505]" />

      <div className="relative z-10 text-center max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-[12rem] leading-none font-serif font-thin text-white/5 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <h2 className="text-3xl font-serif font-light text-white">
              Page Not Found
            </h2>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-[#888888] font-mono text-sm mb-12 leading-relaxed"
        >
          The digital artifact you are looking for seems to have drifted into the void.
          It may have been moved, deleted, or never existed in this timeline.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link
            href="/"
            className="group flex items-center gap-2 px-6 py-3 bg-white text-black font-mono text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-[#EAEAEA] transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Return Home
          </Link>
          <Link
            href="/thoughts"
            className="group flex items-center gap-2 px-6 py-3 border border-white/10 rounded-lg hover:bg-white/5 transition-all font-mono text-xs uppercase tracking-widest text-[#888888] hover:text-white hover:border-white/20"
          >
            <BookOpen className="w-4 h-4" />
            Read Thoughts
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
