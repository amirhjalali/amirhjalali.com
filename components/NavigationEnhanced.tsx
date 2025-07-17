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
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { 
  Home, 
  FolderOpen, 
  FileText, 
  Brain, 
  Cpu, 
  FileUser, 
  BookOpen, 
  Sparkles,
  Mail,
  Menu,
  ChevronDown,
  Search,
  Command as CommandIcon,
  X,
  Zap,
  Code,
  Palette,
  Globe,
  Github,
  Linkedin,
  Twitter
} from 'lucide-react'

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/projects', label: 'Projects', icon: FolderOpen },
  { href: '/articles', label: 'Articles', icon: FileText },
  { href: '/thoughts', label: 'Thoughts', icon: Brain },
  { href: '/ai-tools', label: 'AI Tools', icon: Cpu },
  { href: '/resume', label: 'Resume', icon: FileUser },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/generate', label: 'Generate', icon: Sparkles },
]

const quickActions = [
  { label: 'View Projects', href: '/projects', icon: FolderOpen },
  { label: 'Read Articles', href: '/articles', icon: FileText },
  { label: 'AI Assistant', href: '/generate', icon: Sparkles },
  { label: 'Contact Me', href: '/contact', icon: Mail },
]

export default function NavigationEnhanced() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Cmd+K shortcut
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? 'glass border-b border-white/10 shadow-lg shadow-black/5' 
            : 'bg-dark-bg/50'
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
                <h2 className="text-2xl font-space font-bold relative z-10">
                  <span className="text-gradient">MR AI</span>
                </h2>
                <motion.div 
                  className="absolute -inset-2 bg-gradient-to-r from-ai-green/20 to-ai-blue/20 rounded-full blur-xl"
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
                {/* Quick Access Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative px-4 py-2 text-sm font-medium text-gray-400 hover:text-white group"
                    >
                      Quick Access
                      <ChevronDown className="ml-1 h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56 glass border-white/10">
                    <DropdownMenuLabel className="text-gray-400">Navigation</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-white/10" />
                    {navItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link 
                            href={item.href}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <Icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Regular nav items */}
                {navItems.slice(0, 5).map((item) => {
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="relative px-5 py-2 text-sm font-medium transition-all group"
                    >
                      <span className={`relative z-10 flex items-center gap-2 ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-white'
                      }`}>
                        {item.label}
                      </span>
                      {isActive && (
                        <motion.div
                          layoutId="navbar"
                          className="absolute inset-0 bg-gradient-to-r from-ai-green/20 to-ai-blue/20 rounded-full"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <div className="absolute inset-0 bg-white/5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  )
                })}

                {/* Command palette trigger */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCommandOpen(true)}
                  className="ml-2 text-gray-400 hover:text-white"
                >
                  <CommandIcon className="h-4 w-4 mr-2" />
                  <span className="text-xs">⌘K</span>
                </Button>
              </div>
            </div>

            {/* Desktop CTA and Actions */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Social Links Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass border-white/10">
                  <DropdownMenuLabel className="text-gray-400">Connect</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild>
                    <a href="https://github.com/amirhjalali" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="https://linkedin.com/in/amirhjalali" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                      <Linkedin className="h-4 w-4 mr-2" />
                      LinkedIn
                    </a>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="https://twitter.com/amirhjalali" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                href="/contact"
                className="group relative px-6 py-2.5 overflow-hidden rounded-full font-medium transition-all"
              >
                <span className="relative z-10 flex items-center gap-2 text-black">
                  <Zap className="h-4 w-4" />
                  Get in Touch
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-ai-green to-ai-blue" />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-ai-blue to-ai-green opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                />
              </Link>
            </div>
            
            {/* Mobile menu trigger with Sheet */}
            <div className="lg:hidden flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCommandOpen(true)}
                className="text-gray-400 hover:text-white"
              >
                <Search className="h-5 w-5" />
              </Button>
              
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] glass border-l border-white/10">
                  <SheetHeader>
                    <SheetTitle className="text-2xl font-space">
                      <span className="text-gradient">MR AI</span>
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
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-ai-green/20 to-ai-blue/20 text-white'
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      )
                    })}
                    
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <Link
                        href="/contact"
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gradient-to-r from-ai-green to-ai-blue text-black font-medium rounded-full hover:scale-105 transition-transform"
                      >
                        <Mail className="h-5 w-5" />
                        Get in Touch
                      </Link>
                    </div>
                    
                    <div className="mt-6 flex justify-center gap-4">
                      <a href="https://github.com/amirhjalali" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                        <Github className="h-5 w-5" />
                      </a>
                      <a href="https://linkedin.com/in/amirhjalali" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                        <Linkedin className="h-5 w-5" />
                      </a>
                      <a href="https://twitter.com/amirhjalali" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                        <Twitter className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Quick Actions">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <CommandItem
                  key={action.href}
                  onSelect={() => {
                    setCommandOpen(false)
                    window.location.href = action.href
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{action.label}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
          
          <CommandSeparator />
          
          <CommandGroup heading="All Pages">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <CommandItem
                  key={item.href}
                  onSelect={() => {
                    setCommandOpen(false)
                    window.location.href = item.href
                  }}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </CommandItem>
              )
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}