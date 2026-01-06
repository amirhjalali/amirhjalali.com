'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Linkedin, Twitter, Mail } from 'lucide-react'
import MagneticWrapper from '@/components/ui/magnetic-wrapper'

const navLinks = [
  { href: '/work', label: 'Work' },
  { href: '/thoughts', label: 'Thoughts' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

const socialLinks = [
  { href: 'https://github.com/amirhjalali', icon: Github, label: 'GitHub' },
  { href: 'https://linkedin.com/in/amirhjalali', icon: Linkedin, label: 'LinkedIn' },
  { href: 'https://twitter.com/amirhjalali', icon: Twitter, label: 'Twitter' },
  { href: 'mailto:hello@amirhjalali.com', icon: Mail, label: 'Email' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/10 bg-[#050505]">
      {/* Subtle top gradient line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      <div className="max-w-7xl mx-auto section-padding container-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">

          {/* Brand Column */}
          <div>
            <Link href="/" className="inline-block group">
              <motion.span
                className="text-card-title text-[#EAEAEA] font-serif"
                whileHover={{ opacity: 0.8 }}
              >
                AHJ
              </motion.span>
            </Link>
            <p className="text-body mt-4 max-w-xs">
              Generative AI consultant transforming data into opportunity.
            </p>
          </div>

          {/* Navigation Column */}
          <div>
            <h4 className="text-label text-[#EAEAEA] mb-4">Navigation</h4>
            <nav className="flex flex-col gap-3">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-body hover:text-[#EAEAEA] transition-colors w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Social Column */}
          <div>
            <h4 className="text-label text-[#EAEAEA] mb-4">Connect</h4>
            <div className="flex gap-4">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <MagneticWrapper key={href} magneticStrength={0.3}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-[#888888] hover:text-[#EAEAEA] hover:border-white/20 transition-all"
                    aria-label={label}
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                </MagneticWrapper>
              ))}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <p className="text-micro text-[#666666]">
            &copy; {currentYear} Amir H. Jalali. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
