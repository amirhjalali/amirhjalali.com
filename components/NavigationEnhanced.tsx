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

  // Hide navigation on homepage and notes login page
  if (pathname === '/' || pathname === '/notes/login') return null

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

      {/* Right-side Mobile Menu Panel */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop - transparent to keep left side visible */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-[100] lg:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Compact Slide-in Panel */}
            <motion.div
              id="mobile-menu"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 h-20 bg-[#050505] z-[101] lg:hidden flex items-center"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
            >
              {/* Navigation Links - right aligned, horizontal */}
              <nav className="flex items-center gap-6 px-4">
                {navItems
                  .filter(item => !pathname.startsWith(item.href))
                  .map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: index * 0.05,
                        duration: 0.2,
                        ease: [0.22, 1, 0.36, 1]
                      }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className="text-sm font-mono uppercase tracking-wider text-[#888888] hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    </motion.div>
                  ))}
              </nav>

              {/* Close button */}
              <button
                onClick={() => setMobileOpen(false)}
                className="p-4 text-[#888888] hover:text-white transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}