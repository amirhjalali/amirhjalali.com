'use client'

import Link from 'next/link'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sparkles, ArrowRight, Github, Linkedin, Mail } from 'lucide-react'
import { RippleButton } from '@/components/ui/ripple-button'
import { MagneticWrapper } from '@/components/ui/magnetic-wrapper'

const NameDisplay = () => {
  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      animate={{
        opacity: [1, 0.9, 1]
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }}
    >
      <span className="text-6xl md:text-8xl font-bold text-gradient">
        AMIR
      </span>
    </motion.div>
  )
}

const FloatingOrb = ({ delay = 0 }: { delay?: number }) => {
  return (
    <motion.div
      className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
      style={{
        background: 'radial-gradient(circle, rgba(0,255,136,0.3) 0%, transparent 70%)',
      }}
      animate={{
        x: [0, 100, 0],
        y: [0, -100, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        delay,
        ease: "easeInOut"
      }}
    />
  )
}

export default function HeroEnhanced() {
  const [particlesLoaded, setParticlesLoaded] = useState(false)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const x = useSpring(useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-20, 20]), {
    stiffness: 50,
    damping: 20
  })
  const y = useSpring(useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-20, 20]), {
    stiffness: 50,
    damping: 20
  })

  useEffect(() => {
    setParticlesLoaded(true)

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX)
      mouseY.set(e.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <div className="relative w-full overflow-hidden bg-background">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 mesh-gradient opacity-30" />

        {/* Floating orbs */}
        <FloatingOrb delay={0} />
        <FloatingOrb delay={2} />
        <FloatingOrb delay={4} />

        {/* Grid with parallax */}
        <motion.div
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"
          style={{ x, y }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        {/* Main content with 3D effect */}
        <motion.div
          initial={{ opacity: 0, y: 20, rotateX: -10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1 }}
          style={{ perspective: 1000 }}
          className="text-center max-w-5xl mx-auto"
        >
          {/* Glowing orb behind text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] bg-gradient-radial from-ai-teal/15 dark:from-ai-green/20 via-ai-cyan/8 dark:via-ai-blue/10 to-transparent rounded-full blur-3xl" />
          </div>

          {/* Animated name with 3D effect */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mb-8 relative"
          >
            <motion.h1
              className="text-7xl md:text-9xl font-space tracking-tighter relative"
              style={{
                transformStyle: "preserve-3d",
                transform: "translateZ(50px)",
              }}
            >
              <span className="relative inline-block">
                <NameDisplay />
              </span>
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl text-muted-foreground mt-6 font-light tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              AI Consultant & Engineer
            </motion.p>
          </motion.div>

          {/* Animated tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-2xl md:text-4xl font-light text-foreground mb-6"
          >
            Building the future with
            <span className="text-ai-teal dark:text-ai-green font-medium"> Artificial Intelligence</span>
          </motion.p>

          {/* Enhanced description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="space-y-4 mb-12"
          >
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Welcome to my corner of the internet.
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              I'm currently involved in advising several companies on their Generative AI initiatives.
            </p>
          </motion.div>

          {/* Enhanced CTA Buttons with hover effects */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12"
          >
            <Link href="/projects">
              <button className="group relative px-8 py-4 bg-gradient-to-r from-ai-teal to-ai-cyan dark:from-ai-green dark:to-ai-blue text-white font-semibold text-lg rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-ai-teal/30 dark:hover:shadow-ai-green/30">
                <span className="flex items-center gap-2">
                  Explore Projects
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </Link>

            <Link href="/thoughts">
              <button className="group px-8 py-4 border-2 border-ai-teal/30 dark:border-ai-green/30 text-ai-teal dark:text-ai-green font-medium text-lg rounded-full hover:border-ai-teal dark:hover:border-ai-green hover:bg-ai-teal/10 dark:hover:bg-ai-green/10 transition-all duration-300 hover:scale-105">
                Read Thoughts
              </button>
            </Link>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex justify-center gap-6"
          >
            <a
              href="https://github.com/amirhjalali"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-ai-teal dark:hover:text-ai-green transition-colors block p-2"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://linkedin.com/in/amirhjalali"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-ai-teal dark:hover:text-ai-green transition-colors block p-2"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="mailto:hello@amirhjalali.com"
              className="text-muted-foreground hover:text-ai-teal dark:hover:text-ai-green transition-colors block p-2"
            >
              <Mail className="w-6 h-6" />
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
