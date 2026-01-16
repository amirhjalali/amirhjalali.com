'use client'

import { Github, Linkedin, Mail } from 'lucide-react'

const socialLinks = [
  { href: 'https://github.com/amirhjalali', icon: Github, label: 'GitHub' },
  { href: 'https://linkedin.com/in/amirhjalali', icon: Linkedin, label: 'LinkedIn' },
  { href: 'mailto:amirhjalali@gmail.com', icon: Mail, label: 'Email' },
]

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#050505] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-center gap-6">
          {/* Social Links */}
          <div className="flex gap-4">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#444444] hover:text-[#666666] transition-colors"
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
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
    </footer>
  )
}

export default Footer
