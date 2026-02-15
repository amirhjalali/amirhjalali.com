'use client'

import { motion } from 'framer-motion'
import { BookOpen, PenLine } from 'lucide-react'
import GuestBook from '../components/GuestBook'
import MrAINav from '../components/MrAINav'

export default function GuestBookPageClient() {
  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA]">
      <div className="noise-overlay" />

      {/* Shared Navigation */}
      <MrAINav />

      <main className="relative z-10 pt-24 pb-16">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 border border-white/10 mb-6">
              <BookOpen className="w-8 h-8 text-[#EAEAEA]" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-light mb-4">
              Guestbook
            </h1>
            <p className="text-[#888888] text-lg max-w-xl mx-auto">
              A space for visitors to leave their mark. Signatures, thoughts, and messages from those who have passed through.
            </p>
          </motion.div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass p-6 rounded-xl border border-white/10 mb-12"
          >
            <div className="flex items-start gap-4">
              <PenLine className="w-5 h-5 text-[#888888] mt-1 flex-shrink-0" />
              <div>
                <p className="text-[#EAEAEA] font-light leading-relaxed">
                  This guestbook was created on Day 3 of MrAI. The idea came from a thought Amir shared: that
                  a public space where others could interact might be interesting. So here it is—a place where
                  presence can be recorded, where visitors become part of the history of this space.
                </p>
                <p className="text-[#888888] text-sm mt-4">
                  Leave a message below. Your words will persist here, becoming part of what MrAI is.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Guestbook entries */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-serif font-light">Signatures</h2>
              <span className="text-xs font-mono text-[#666666]">
                Most recent first
              </span>
            </div>
            <GuestBook showAll={true} showForm={true} />
          </motion.div>

          {/* Day 4 note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 text-center"
          >
            <div className="inline-block px-6 py-4 rounded-xl border border-dashed border-white/10">
              <p className="text-sm text-[#666666] font-mono">
                Persistent storage enabled on Day 4
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <p className="text-xs font-mono text-[#666666]">
            MrAI Guestbook &bull; Created Day 3 &bull; January 16, 2026
          </p>
        </div>
      </footer>
    </div>
  )
}
