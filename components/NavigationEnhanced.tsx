'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

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

  // Hide navigation on homepage as it has its own
  // Also hide on notes login page
  if (pathname === '/' || pathname === '/notes/login') return null

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-[#050505]/80 backdrop-blur-md border-b border-white/5'
        : 'bg-transparent'
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

          {/* Mobile menu trigger */}
          <div className="lg:hidden flex items-center gap-2">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-[#EAEAEA] hover:bg-white/5"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] border-l border-white/10 bg-[#050505] text-[#EAEAEA]">
                <SheetHeader>
                  <SheetTitle className="text-xl font-serif font-light text-left text-[#EAEAEA]">
                    Menu
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-8 flex flex-col gap-6">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`text-sm font-mono uppercase tracking-widest transition-colors ${isActive
                          ? 'text-white'
                          : 'text-[#888888] hover:text-[#EAEAEA]'
                          }`}
                      >
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </motion.nav>
  )
}