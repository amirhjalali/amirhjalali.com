'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Spotlight from '@/components/Spotlight'
import { Mail, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ContactPageClient() {
  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      {/* Background effects */}
      <div className="noise-overlay" />
      <Spotlight />

      <div className="relative z-10 section-padding container-padding max-w-4xl mx-auto">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-12"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-label text-[#888888] hover:text-[#EAEAEA] transition-colors"
            aria-label="Go back to homepage"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16 text-center"
        >
          <h1 className="text-page-title mb-6">
            Get in Touch
          </h1>
          <p className="text-body-lg max-w-2xl mx-auto">
            Have a project in mind or want to collaborate? I'm always open to discussing new opportunities and ideas.
          </p>
        </motion.header>

        {/* Contact Info - Centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center space-y-12"
        >
          {/* Email Button */}
          <Button
            asChild
            size="lg"
            className="bg-white text-black hover:bg-[#EAEAEA] transition-colors font-mono uppercase tracking-widest px-8 py-6 text-base"
          >
            <a href="mailto:amirhjalali@gmail.com">
              <Mail className="mr-3 h-5 w-5" />
              amirhjalali@gmail.com
            </a>
          </Button>

          {/* Location */}
          <div className="flex items-center gap-3 text-[#888888]">
            <MapPin className="w-5 h-5" aria-hidden="true" />
            <span className="font-mono text-sm uppercase tracking-widest">Brooklyn, NY</span>
          </div>

          {/* Social Links */}
          <div className="pt-8 border-t border-white/10 w-full max-w-xs">
            <h3 className="text-label text-[#888888] mb-6 text-center">Connect</h3>
            <div className="flex justify-center gap-6">
              <a
                href="https://linkedin.com/in/amirhjalali"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#888888] hover:text-[#EAEAEA] hover:border-white/20 transition-all"
                aria-label="Visit LinkedIn profile"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="https://github.com/amirhjalali"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#888888] hover:text-[#EAEAEA] hover:border-white/20 transition-all"
                aria-label="Visit GitHub profile"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="https://twitter.com/amirhjalali"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#888888] hover:text-[#EAEAEA] hover:border-white/20 transition-all"
                aria-label="Visit Twitter profile"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
