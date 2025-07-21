'use client'

import Link from 'next/link'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sparkles, ArrowRight, Github, Linkedin, Mail } from 'lucide-react'
import { RippleButton } from '@/components/ui/ripple-button'
import { MagneticWrapper } from '@/components/ui/magnetic-wrapper'

const LetterMorphAnimation = () => {
  const [isAmir, setIsAmir] = useState(true)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAmir(prev => !prev)
    }, 4000) // Switch every 4 seconds
    return () => clearInterval(interval)
  }, [])

  // Define the letters and their arrangements
  const letters = ['A', 'M', 'I', 'R']
  
  // Configuration for smooth letter morphing
  const configs = {
    AMIR: [
      { letter: 'A', order: 0, opacity: 1 },
      { letter: 'M', order: 1, opacity: 1 },
      { letter: 'I', order: 2, opacity: 1 },
      { letter: 'R', order: 3, opacity: 1 }
    ],
    MRAI: [
      { letter: 'M', order: 0, opacity: 1 },
      { letter: 'R', order: 1, opacity: 1 },
      { letter: 'A', order: 2.5, opacity: 1 }, // 2.5 to add space
      { letter: 'I', order: 3.5, opacity: 1 }
    ]
  }

  const currentConfig = isAmir ? configs.AMIR : configs.MRAI

  return (
    <div className="relative inline-flex items-center justify-center" style={{ minWidth: '400px' }}>
      {letters.map((letter) => {
        const config = currentConfig.find(c => c.letter === letter) || { order: 0, opacity: 0 }
        
        return (
          <motion.span
            key={letter}
            className="absolute text-6xl md:text-8xl font-bold"
            style={{
              color: '#00FF88',
              textShadow: `
                0 0 20px rgba(0, 255, 136, 0.8),
                0 0 40px rgba(0, 255, 136, 0.4),
                0 0 60px rgba(0, 255, 136, 0.2)
              `,
              display: 'inline-block',
            }}
            animate={{
              x: config.order * 70 - 105, // Center the text by offsetting (3.5 letters * 70px / 2 = 122.5, rounded to 105)
              opacity: config.opacity,
              scale: [1, 0.95, 1], // Subtle pulsing effect
            }}
            transition={{
              x: {
                type: "spring",
                stiffness: 80,
                damping: 20,
                duration: 2
              },
              opacity: {
                duration: 0.8,
                ease: "easeInOut"
              },
              scale: {
                duration: 2,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut"
              }
            }}
          >
            {letter}
            
            {/* Glow effect that intensifies during transition */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              animate={{
                opacity: isAmir ? 0 : [0, 0.5, 0]
              }}
              transition={{
                duration: 2,
                ease: "easeInOut"
              }}
              style={{
                background: 'radial-gradient(circle, rgba(0, 255, 136, 0.4) 0%, transparent 70%)',
                filter: 'blur(20px)',
                transform: 'scale(1.5)'
              }}
            />
          </motion.span>
        )
      })}
      
      {/* Space indicator for MR AI */}
      <motion.span
        className="absolute text-6xl md:text-8xl font-bold"
        style={{
          color: '#00FF88',
          opacity: 0.3,
          left: '50%',
          transform: 'translateX(-50%)'
        }}
        animate={{
          x: 35, // Position of space (140 - 105 = 35)
          opacity: isAmir ? 0 : 0.3,
          scale: isAmir ? 0.8 : 1
        }}
        transition={{
          duration: 1.5,
          ease: "easeInOut"
        }}
      >
        |
      </motion.span>
      
      {/* Underline that morphs */}
      <motion.div
        className="absolute bottom-0 h-1 bg-gradient-to-r from-ai-green to-ai-blue"
        style={{
          left: '50%',
          transform: 'translateX(-50%)'
        }}
        animate={{
          width: isAmir ? '280px' : '350px',
          opacity: [0.6, 1, 0.6]
        }}
        transition={{
          width: {
            type: "spring",
            stiffness: 100,
            damping: 30
          },
          opacity: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }
        }}
      />
    </div>
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
              <span className="relative inline-block" style={{ color: '#00FF88' }}>
                <LetterMorphAnimation />
              </span>
            </motion.h1>
            <motion.p 
              className="text-lg md:text-xl text-gray-400 mt-2 font-light tracking-widest uppercase"
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
            className="text-2xl md:text-4xl font-light text-foreground mb-6 leading-relaxed"
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
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Welcome to my corner of the internet.
            </p>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
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
            <MagneticWrapper magneticStrength={0.3}>
              <Link href="/projects">
                <RippleButton
                  className="relative px-8 py-4 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold text-lg hover:from-ai-blue hover:to-ai-green transition-all duration-300"
                  rippleColor="rgba(255, 255, 255, 0.5)"
                >
                  <span className="flex items-center gap-2">
                    Explore Projects
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </RippleButton>
              </Link>
            </MagneticWrapper>
            
            <MagneticWrapper magneticStrength={0.2}>
              <Link href="/thoughts">
                <RippleButton
                  variant="outline"
                  className="px-8 py-4 border-2 border-border text-foreground font-medium text-lg hover:border-ai-green/50 hover:text-ai-green hover:shadow-lg hover:shadow-ai-green/20"
                  rippleColor="rgba(0, 255, 136, 0.3)"
                >
                  Read Thoughts
                </RippleButton>
              </Link>
            </MagneticWrapper>

            <MagneticWrapper magneticStrength={0.2}>
              <Link href="/generate">
                <RippleButton
                  variant="outline"
                  className="px-8 py-4 border-2 border-ai-blue/30 text-ai-blue font-medium text-lg hover:border-ai-blue hover:bg-ai-blue/10 hover:shadow-lg hover:shadow-ai-blue/20"
                  rippleColor="rgba(0, 217, 255, 0.3)"
                >
                  AI Assistant
                </RippleButton>
              </Link>
            </MagneticWrapper>
          </motion.div>

          {/* Social links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="flex justify-center gap-6"
          >
            <MagneticWrapper magneticStrength={0.5}>
              <a
                href="https://github.com/amirhjalali"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors block p-2"
              >
                <Github className="w-6 h-6" />
              </a>
            </MagneticWrapper>
            <MagneticWrapper magneticStrength={0.5}>
              <a
                href="https://linkedin.com/in/amirhjalali"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors block p-2"
              >
                <Linkedin className="w-6 h-6" />
              </a>
            </MagneticWrapper>
            <MagneticWrapper magneticStrength={0.5}>
              <a
                href="/contact"
                className="text-muted-foreground hover:text-foreground transition-colors block p-2"
              >
                <Mail className="w-6 h-6" />
              </a>
            </MagneticWrapper>
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
            className="w-6 h-10 rounded-full border-2 border-border flex justify-center pt-2 hover:border-ai-green/50 transition-colors cursor-pointer"
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
          >
            <motion.div 
              className="w-1 h-3 bg-muted-foreground rounded-full"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          </motion.div>
        </motion.div>
      </div>
    </main>
  )
}