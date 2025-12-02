'use client'

import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'
import Spotlight from '@/components/Spotlight'

// Dynamic import ContactForm for better performance
const ContactForm = dynamic(() => import('@/components/ContactForm'), {
  loading: () => (
    <div className="glass p-8 rounded-2xl border border-white/10">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-12" />
          <Skeleton className="h-12" />
        </div>
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-32" />
        <Skeleton className="h-12" />
      </div>
    </div>
  ),
  ssr: false
})

const contactMethods = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    title: 'Email',
    description: 'For collaboration, consulting, or general inquiries',
    value: 'hello@amirhjalali.com',
    action: 'mailto:hello@amirhjalali.com',
    actionText: 'Send Email'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    title: 'LinkedIn',
    description: 'Connect professionally and view my background',
    value: 'linkedin.com/in/amirhjalali',
    action: 'https://linkedin.com/in/amirhjalali',
    actionText: 'View Profile'
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
      </svg>
    ),
    title: 'GitHub',
    description: 'Explore my open source projects and contributions',
    value: 'github.com/amirhjalali',
    action: 'https://github.com/amirhjalali',
    actionText: 'View Repositories'
  }
]

export default function ContactPage() {

  return (
    <div className="min-h-screen relative bg-[#050505] text-[#EAEAEA]">
      {/* Background effects */}
      <div className="noise-overlay" />
      <Spotlight />

      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-light tracking-tight mb-6 text-[#EAEAEA]">
            Let's Connect
          </h1>
          <p className="text-xl font-mono text-[#888888] max-w-3xl mx-auto">
            Whether you're interested in collaboration, have questions about AI, or want to discuss a project, I'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ContactForm />
          </motion.div>

          {/* Contact Methods */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-2xl mb-6 font-serif font-light text-[#EAEAEA]">Other Ways to Connect</h2>
            <div className="space-y-4">
              {contactMethods.map((method, index) => (
                <motion.div
                  key={method.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="glass p-6 rounded-xl border border-white/10 hover:bg-white/5 transition-all group backdrop-blur-md"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-[#EAEAEA] group-hover:scale-110 transition-transform">
                      {method.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="mb-1 font-serif font-light text-lg text-[#EAEAEA]">{method.title}</h3>
                      <p className="text-[#888888] text-xs font-mono uppercase tracking-widest mb-2">{method.description}</p>
                      <p className="text-[#EAEAEA] text-sm mb-3 font-mono">{method.value}</p>
                      <a
                        href={method.action}
                        className="text-xs text-[#888888] hover:text-[#EAEAEA] transition-colors inline-flex items-center gap-1 font-mono uppercase tracking-widest"
                      >
                        {method.actionText}
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}