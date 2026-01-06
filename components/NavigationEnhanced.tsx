'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const navItems = [
  { href: '/work', label: 'Work' },
  { href: '/thoughts', label: 'Thoughts' },
  { href: '/about', label: 'About' },
]

export default function NavigationEnhanced() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Hide navigation on homepage and all notes pages (notes has its own header)
  if (pathname === '/' || pathname?.startsWith('/notes')) return null

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      role="navigation"
      aria-label="Main navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-[#050505]/80 backdrop-blur-md border-b border-white/5'
        : 'bg-[#050505]/40 backdrop-blur-sm'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 group">
            <h2 className="text-xl font-serif font-light tracking-tight text-[#EAEAEA]">
              Amir H. Jalali
            </h2>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`text-xs font-mono uppercase tracking-widest transition-colors ${isActive
                      ? 'text-white'
                      : 'text-[#888888] hover:text-[#EAEAEA]'
                      }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
              {/* Theme Toggle - Hidden for now as we are enforcing Dark Mode */}
              {/* <ThemeToggle /> */}
            </div>
          </div>

          {/* Mobile menu - Minimal Hamburger */}
          <div className="lg:hidden">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="relative w-10 h-10 flex items-center justify-center text-[#EAEAEA] hover:text-white transition-colors"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              <motion.div
                animate={mobileOpen ? 'open' : 'closed'}
                className="flex flex-col items-center justify-center"
              >
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: 45, y: 6 }
                  }}
                  className="w-5 h-px bg-current mb-1.5"
                />
                <motion.span
                  variants={{
                    closed: { opacity: 1 },
                    open: { opacity: 0 }
                  }}
                  className="w-5 h-px bg-current mb-1.5"
                />
                <motion.span
                  variants={{
                    closed: { rotate: 0, y: 0 },
                    open: { rotate: -45, y: -6 }
                  }}
                  className="w-5 h-px bg-current"
                />
              </motion.div>
            </button>
          </div>

        </div>
      </div>

      {/* Full-screen Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
          >
            {/* Close button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-6 right-6 p-2 text-[#888888] hover:text-white transition-colors"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation Links - centered, stacked */}
            <nav className="flex flex-col items-center gap-8">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.1,
                      duration: 0.4,
                      ease: [0.23, 1, 0.32, 1]
                    }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`text-3xl font-serif font-light transition-colors ${
                        isActive ? 'text-white' : 'text-[#888888] hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}
            </nav>

            {/* Home link at bottom */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.4 }}
              className="absolute bottom-8"
            >
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="text-xs font-mono uppercase tracking-widest text-[#666666] hover:text-white transition-colors"
              >
                Home
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}