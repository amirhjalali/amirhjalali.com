'use client'

import Link from 'next/link'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Sparkles, ArrowRight, Github, Linkedin, Mail } from 'lucide-react'
import { RippleButton } from '@/components/ui/ripple-button'
import { MagneticWrapper } from '@/components/ui/magnetic-wrapper'

const MagneticLetterDance = () => {
  const [phase, setPhase] = useState(0) // 0: AMIR, 1: scattered, 2: MR AI
  const [screenShake, setScreenShake] = useState(false)
  
  useEffect(() => {
    const sequence = async () => {
      // Stay as AMIR for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Phase 1: Scatter letters (dramatic pull apart)
      setPhase(1)
      
      // Wait for scatter animation to complete
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Phase 2: Magnetic snap to MR AI with screen shake
      setScreenShake(true)
      setPhase(2)
      
      // End screen shake
      setTimeout(() => setScreenShake(false), 200)
      
      // Stay as MR AI for 3 seconds
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Reset to AMIR
      setPhase(0)
    }
    
    sequence()
    const interval = setInterval(sequence, 8500) // Total cycle: 8.5 seconds
    return () => clearInterval(interval)
  }, [])

  // Letter positions for each phase
  const letterPositions = {
    // Phase 0: AMIR positions
    0: [
      { letter: 'A', x: 0, y: 0, rotation: 0 },
      { letter: 'M', x: 80, y: 0, rotation: 0 },
      { letter: 'I', x: 160, y: 0, rotation: 0 },
      { letter: 'R', x: 200, y: 0, rotation: 0 }
    ],
    // Phase 1: Scattered positions (magnetic chaos)
    1: [
      { letter: 'A', x: -120, y: -80, rotation: -45 },
      { letter: 'M', x: 150, y: -120, rotation: 30 },
      { letter: 'I', x: -80, y: 100, rotation: 60 },
      { letter: 'R', x: 180, y: 90, rotation: -30 }
    ],
    // Phase 2: MR AI positions  
    2: [
      { letter: 'M', x: 0, y: 0, rotation: 0 },
      { letter: 'R', x: 80, y: 0, rotation: 0 },
      { letter: ' ', x: 160, y: 0, rotation: 0 },
      { letter: 'A', x: 180, y: 0, rotation: 0 },
      { letter: 'I', x: 220, y: 0, rotation: 0 }
    ]
  }

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      style={{
        width: '300px',
        height: '120px',
        letterSpacing: '0.1em'
      }}
      animate={screenShake ? {
        x: [0, -2, 2, -2, 2, 0],
        y: [0, -1, 1, -1, 1, 0]
      } : {}}
      transition={{ duration: 0.2 }}
    >
      {/* Render letters based on current phase */}
      {(phase === 2 ? letterPositions[2] : letterPositions[0]).map((letterData, index) => {
        const scatterData = letterPositions[1][index] || { x: 0, y: 0, rotation: 0 }
        
        return (
          <motion.span
            key={`letter-${letterData.letter}-${index}`}
            className="absolute text-6xl md:text-8xl font-bold"
            style={{
              color: '#00FF88',
              textShadow: `
                0 0 20px rgba(0, 255, 136, 0.8),
                0 0 40px rgba(0, 255, 136, 0.4),
                0 0 60px rgba(0, 255, 136, 0.2)
              `,
              display: 'inline-block',
              transformOrigin: 'center'
            }}
            animate={{
              x: phase === 1 ? scatterData.x : letterData.x,
              y: phase === 1 ? scatterData.y : letterData.y,
              rotate: phase === 1 ? scatterData.rotation : letterData.rotation,
              scale: phase === 1 ? 1.2 : 1,
              opacity: letterData.letter === ' ' ? 0 : 1
            }}
            transition={{
              type: phase === 2 ? "spring" : "spring",
              stiffness: phase === 2 ? 400 : 150,
              damping: phase === 2 ? 25 : 20,
              duration: phase === 1 ? 1.2 : 0.8,
              ease: phase === 1 ? [0.25, 0.46, 0.45, 0.94] : [0.68, -0.55, 0.265, 1.55]
            }}
          >
            {letterData.letter === ' ' ? '\u00A0' : letterData.letter}
            
            {/* Particle trail effect during scatter */}
            {phase === 1 && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 0.6, repeat: 2 }}
              >
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-ai-green rounded-full"
                    style={{
                      left: '50%',
                      top: '50%'
                    }}
                    animate={{
                      x: (Math.random() - 0.5) * 100,
                      y: (Math.random() - 0.5) * 100,
                      opacity: [1, 0]
                    }}
                    transition={{
                      duration: 0.8,
                      delay: i * 0.05,
                      ease: "easeOut"
                    }}
                  />
                ))}
              </motion.div>
            )}
          </motion.span>
        )
      })}
      
      {/* Electromagnetic field effect during snap */}
      {phase === 2 && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ 
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.5, 2],
          }}
          transition={{ duration: 0.4 }}
          style={{
            background: `radial-gradient(circle, transparent 40%, rgba(0, 255, 136, 0.1) 70%, transparent 90%)`,
            borderRadius: '50%'
          }}
        />
      )}
    </motion.div>
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
                <MagneticLetterDance />
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