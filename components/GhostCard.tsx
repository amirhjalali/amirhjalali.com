'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GhostCardProps {
    title: string
    description: string
    className?: string
    delay?: number
}

export default function GhostCard({ title, description, className, delay = 0 }: GhostCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay, ease: "easeOut" }}
            className={cn(
                "group relative overflow-hidden rounded-xl border border-white/10 bg-transparent backdrop-blur-md transition-all duration-500 hover:bg-white/5",
                className
            )}
        >
            <div className="p-8">
                <h3 className="font-serif text-2xl font-light tracking-tight text-[#EAEAEA] mb-2 group-hover:text-white transition-colors">
                    {title}
                </h3>
                <p className="font-mono text-xs uppercase tracking-widest text-[#888888] group-hover:text-[#EAEAEA] transition-colors">
                    {description}
                </p>
            </div>

            {/* Subtle glow on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent" />
            </div>
        </motion.div>
    )
}
