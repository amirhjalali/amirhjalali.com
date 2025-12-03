'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useMotionTemplate, useSpring } from 'framer-motion'

export default function PortraitReveal() {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Smooth out the mouse movement for the spotlight effect
    const springConfig = { damping: 25, stiffness: 150, mass: 0.5 }
    const springX = useSpring(mouseX, springConfig)
    const springY = useSpring(mouseY, springConfig)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY])

    // Create a radial gradient mask that follows the mouse
    const maskImage = useMotionTemplate`radial-gradient(circle 300px at ${springX}px ${springY}px, black, transparent)`

    return (
        <>
            {/* Base Layer - The "Ghost" */}
            {/* Always visible but very faint, fading out towards top-left */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute bottom-0 right-[-5%] w-[50vw] max-w-[700px] opacity-[0.08] mix-blend-screen grayscale contrast-125">
                    <img
                        src="/AmirPortraitWebsite.jpg"
                        alt=""
                        className="w-full h-auto"
                        style={{
                            maskImage: 'linear-gradient(to top left, black 20%, transparent 80%)',
                            WebkitMaskImage: 'linear-gradient(to top left, black 20%, transparent 80%)'
                        }}
                    />
                </div>
            </div>

            {/* Reveal Layer - The "Light" */}
            {/* Only visible under the mouse cursor */}
            <motion.div
                className="fixed inset-0 z-0 pointer-events-none overflow-hidden"
                style={{
                    maskImage,
                    WebkitMaskImage: maskImage
                }}
            >
                <div className="absolute bottom-0 right-[-5%] w-[50vw] max-w-[700px] opacity-40 grayscale contrast-125">
                    <img
                        src="/AmirPortraitWebsite.jpg"
                        alt="Amir H. Jalali"
                        className="w-full h-auto"
                        style={{
                            maskImage: 'linear-gradient(to top left, black 40%, transparent 90%)',
                            WebkitMaskImage: 'linear-gradient(to top left, black 40%, transparent 90%)'
                        }}
                    />
                </div>
            </motion.div>
        </>
    )
}
