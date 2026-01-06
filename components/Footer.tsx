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
    <footer className="bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-xs text-[#666666]">
            © {currentYear} Amir H. Jalali
          </p>

          {/* Social Links */}
          <div className="flex gap-4">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#666666] hover:text-[#EAEAEA] transition-colors"
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
