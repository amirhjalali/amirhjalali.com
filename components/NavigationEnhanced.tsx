'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import {
  Home,
  FolderOpen,
  FileText,
  Brain,
  Cpu,
  FileUser,
  BookOpen,
  Mail,
  Menu,
  ChevronDown,
  X,
  Zap,
  Code,
  Palette,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'

const navItems = [
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/thoughts', label: 'Thoughts', icon: Brain },
  { href: '/resume', label: 'Resume', icon: FileUser },
  { href: '/contact', label: 'Contact', icon: Mail },
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

  return (
    <>
      <motion.nav
        id="navigation"
        role="navigation"
        aria-label="Main navigation"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass border-b shadow-lg shadow-black/5 dark:shadow-black/5'
            : 'bg-white/50 dark:bg-dark-bg/50'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo with enhanced hover effect */}
            <Link href="/" className="flex-shrink-0 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <h2 className="text-2xl font-lato relative z-10 uppercase">
                  <span className="text-gradient">AMIR H. JALALI</span>
                </h2>
                <motion.div
                  className="absolute -inset-2 bg-gradient-to-r from-ai-teal/20 to-ai-cyan/20 dark:from-ai-green/20 dark:to-ai-blue/20 rounded-full blur-xl"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </Link>
            
            {/* Desktop Navigation with dropdowns */}
            <div className="hidden lg:block">
              <div className="flex items-center space-x-1">
                {/* Regular nav items */}
                {navItems.map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="relative px-5 py-2 text-sm font-medium transition-all group"
                    >
                      <span className={`relative z-10 flex items-center gap-2 uppercase ${
                        isActive
                          ? 'text-ai-teal dark:text-white'
                          : 'text-gray-600 dark:text-gray-400 group-hover:text-ai-teal dark:group-hover:text-white'
                      }`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar"
                          className="absolute inset-0 bg-gradient-to-r from-ai-teal/20 to-ai-cyan/20 dark:from-ai-green/20 dark:to-ai-blue/20 rounded-full"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  )
                })}

                {/* Theme Toggle */}
                <ThemeToggle />
              </div>
            </div>


            {/* Mobile menu trigger with Sheet */}
            <div className="lg:hidden flex items-center gap-2">
              <ThemeToggle />
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="text-gray-600 dark:text-gray-400 hover:text-ai-teal dark:hover:text-white"
                    aria-label="Open navigation menu"
                    aria-expanded={mobileOpen}
                  >
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] border-l border-border bg-background">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-lato uppercase">
                      <span className="text-gradient">AMIR H. JALALI</span>
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-8 flex flex-col gap-2">
                    {navItems.map((item) => {
                      const isActive = pathname === item.href
                      const Icon = item.icon
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all uppercase ${
                            isActive
                              ? 'bg-gradient-to-r from-ai-teal/20 to-ai-cyan/20 dark:from-ai-green/20 dark:to-ai-blue/20 text-ai-teal dark:text-white'
                              : 'text-gray-600 dark:text-gray-400 hover:text-ai-teal dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
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

    </>
  )
}