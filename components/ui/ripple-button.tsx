'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { ButtonProps, buttonVariants } from "./button"
import { motion, AnimatePresence } from "framer-motion"

interface RippleButtonProps extends ButtonProps {
  rippleColor?: string
  children: React.ReactNode
}

interface Ripple {
  x: number
  y: number
  size: number
  id: number
}

const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ className, variant, size, rippleColor = "rgba(255, 255, 255, 0.3)", children, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Ripple[]>([])
    const buttonRef = React.useRef<HTMLButtonElement>(null)

    const addRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = buttonRef.current || event.currentTarget
      const rect = button.getBoundingClientRect()
      const size = Math.max(rect.width, rect.height)
      const x = event.clientX - rect.left - size / 2
      const y = event.clientY - rect.top - size / 2

      const newRipple = { x, y, size, id: Date.now() }
      setRipples((prevRipples) => [...prevRipples, newRipple])

      // Remove ripple after animation
      setTimeout(() => {
        setRipples((prevRipples) => prevRipples.filter((r) => r.id !== newRipple.id))
      }, 600)
    }

    return (
      <button
        ref={(node) => {
          if (ref) {
            if (typeof ref === 'function') {
              ref(node)
            } else {
              ref.current = node
            }
          }
          buttonRef.current = node
        }}
        className={cn(buttonVariants({ variant, size }), "relative overflow-hidden", className)}
        onMouseDown={addRipple}
        {...props}
      >
        {children}
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                backgroundColor: rippleColor,
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
        </AnimatePresence>
      </button>
    )
  }
)

RippleButton.displayName = "RippleButton"

export { RippleButton }