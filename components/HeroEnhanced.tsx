'use client'

import Link from 'next/link'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sparkles, ArrowRight, Github, Linkedin, Mail } from 'lucide-react'

const CyclingTypewriter = () => {
  const texts = ['AMIR JALALI', 'MR AI']
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  const currentText = texts[currentTextIndex]

  useEffect(() => {
    const typeSpeed = isDeleting ? 50 : 100
    const pauseTime = 2000

    if (isPaused) {
      const timeout = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, pauseTime)
      return () => clearTimeout(timeout)
    }

    if (!isDeleting && currentIndex < currentText.length) {
      // Typing forward
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + currentText[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, typeSpeed)
      return () => clearTimeout(timeout)
    } else if (!isDeleting && currentIndex === currentText.length) {
      // Finished typing, pause before deleting
      setIsPaused(true)
    } else if (isDeleting && displayedText.length > 0) {
      // Deleting
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev.slice(0, -1))
      }, typeSpeed)
      return () => clearTimeout(timeout)
    } else if (isDeleting && displayedText.length === 0) {
      // Finished deleting, move to next text
      setIsDeleting(false)
      setCurrentIndex(0)
      setCurrentTextIndex(prev => (prev + 1) % texts.length)
    }
  }, [currentIndex, currentText, isDeleting, isPaused, displayedText])

  return (
    <span className="relative">
      {displayedText}
      <motion.span
        animate={{ opacity: [0, 1] }}
        transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        className="inline-block w-[3px] h-[1.2em] bg-ai-green ml-1"
      />
    </span>
  )
}

const FloatingOrb = ({ delay = 0 }: { delay?: number }) => {
  return (
    <motion.div
      className="absolute w-64 h-64 rounded-full"
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0.1, 0.3, 0.1],
        scale: [1, 1.2, 1],
        x: [0, 100, 0],
        y: [0, -50, 0],
      }}
      transition={{
        duration: 10,
        delay,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      style={{
        background: `radial-gradient(circle, rgba(0, 255, 136, 0.3) 0%, transparent 70%)`,
        filter: 'blur(40px)',
      }}
    />
  )
}

export default function HeroEnhanced() {
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  
  const springConfig = { damping: 25, stiffness: 150 }
  const x = useSpring(mouseX, springConfig)
  const y = useSpring(mouseY, springConfig)
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      const x = (clientX / innerWidth - 0.5) * 20
      const y = (clientY / innerHeight - 0.5) * 20
      mouseX.set(x)
      mouseY.set(y)
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  const [particlesLoaded, setParticlesLoaded] = useState(false)

  useEffect(() => {
    setParticlesLoaded(true)
  }, [])

  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated background layers */}
      <div className="absolute inset-0">
        {/* Floating orbs */}
        <FloatingOrb delay={0} />
        <FloatingOrb delay={2} />
        <FloatingOrb delay={4} />
        
        {/* Grid with parallax */}
        <motion.div 
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"
          style={{ x, y }}
        />
        
        {/* Animated particles */}
        {particlesLoaded && [...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-ai-green/50 rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              y: [null, -window.innerHeight],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5,
              ease: "linear",
            }}
          />
        ))}
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
            <div className="w-[600px] h-[600px] bg-gradient-radial from-ai-green/20 via-ai-blue/10 to-transparent rounded-full blur-3xl" />
          </div>
          
          {/* Animated name with 3D effect */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="mb-8 relative"
          >
            <motion.h1 
              className="text-7xl md:text-9xl font-space font-black tracking-tighter relative"
              style={{
                transformStyle: "preserve-3d",
                transform: "translateZ(50px)",
              }}
            >
              <span className="text-gradient glow relative">
                <CyclingTypewriter />
                <Sparkles className="absolute -top-8 -right-8 w-8 h-8 text-ai-green animate-pulse" />
              </span>
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-gray-500 mt-2 font-light tracking-widest uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Amir Jalali
            </motion.p>
          </motion.div>

          {/* Animated tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-2xl md:text-4xl font-light text-gray-300 mb-6 leading-relaxed"
          >
            Building the future with
            <span className="text-white font-medium"> Artificial Intelligence</span>
          </motion.p>

          {/* Enhanced description */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="space-y-4 mb-12"
          >
            <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Welcome to my corner of the internet.
            </p>
            <p className="text-base md:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
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
            <Link 
              href="/projects"
              className="group relative px-8 py-4 overflow-hidden rounded-full font-semibold text-lg transition-all hover:scale-105"
            >
              <span className="relative z-10 flex items-center gap-2 text-black">
                Explore Projects
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-ai-green to-ai-blue" />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-ai-blue to-ai-green"
                initial={{ x: "100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </Link>
            
            <Link 
              href="/thoughts"
              className="group px-8 py-4 rounded-full border-2 border-white/20 text-white font-medium text-lg hover:border-ai-green/50 hover:text-ai-green transition-all hover:scale-105 hover:shadow-lg hover:shadow-ai-green/20"
            >
              Read Thoughts
            </Link>

            <Link 
              href="/generate"
              className="group px-8 py-4 rounded-full border-2 border-ai-blue/30 text-ai-blue font-medium text-lg hover:border-ai-blue hover:bg-ai-blue/10 transition-all hover:scale-105 hover:shadow-lg hover:shadow-ai-blue/20"
            >
              AI Assistant
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
              className="text-gray-400 hover:text-white transition-colors hover:scale-110"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://linkedin.com/in/amirhjalali"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors hover:scale-110"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="/contact"
              className="text-gray-400 hover:text-white transition-colors hover:scale-110"
            >
              <Mail className="w-6 h-6" />
            </a>
          </motion.div>
        </motion.div>

        {/* Enhanced scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2 hover:border-ai-green/50 transition-colors cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <motion.div 
              className="w-1 h-3 bg-white/50 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}