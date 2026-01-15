'use client'

import { Github, Linkedin, Mail } from 'lucide-react'
import Link from 'next/link'

const socialLinks = [
  { href: 'https://github.com/amirhjalali', icon: Github, label: 'GitHub' },
  { href: 'https://linkedin.com/in/amirhjalali', icon: Linkedin, label: 'LinkedIn' },
  { href: 'mailto:amirhjalali@gmail.com', icon: Mail, label: 'Email' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#050505] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Top section with tagline */}
        <div className="flex flex-col items-center mb-8">
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-[#444444] mb-2">
            Building with AI
          </p>
          <div className="w-8 h-px bg-white/10" />
        </div>

        {/* Main footer content */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Left - Navigation echo */}
          <nav className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest">
            <Link href="/work" className="text-[#444444] hover:text-[#888888] transition-colors">Work</Link>
            <span className="text-[#333333]">·</span>
            <Link href="/thoughts" className="text-[#444444] hover:text-[#888888] transition-colors">Thoughts</Link>
            <span className="text-[#333333]">·</span>
            <Link href="/about" className="text-[#444444] hover:text-[#888888] transition-colors">About</Link>
            <span className="text-[#333333]">·</span>
            <Link href="/mrai" className="text-[#444444] hover:text-[#888888] transition-colors">MrAI</Link>
          </nav>

          {/* Right - Social & Copyright */}
          <div className="flex items-center gap-6">
            {/* Social Links */}
            <div className="flex gap-3">
              {socialLinks.map(({ href, icon: Icon, label }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#444444] hover:text-[#888888] transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-white/10" />

            {/* Copyright */}
            <p className="text-[10px] font-mono text-[#444444]">
              © {currentYear}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
