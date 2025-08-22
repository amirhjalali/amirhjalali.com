'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Video, Sparkles } from 'lucide-react'
import { trackCalendlyBooking } from '@/lib/analytics'

interface CalendlyWidgetProps {
  url?: string
  className?: string
  title?: string
  description?: string
}

export default function CalendlyWidget({ 
  url = "https://calendly.com/amirhjalali", // Default placeholder URL
  className = "",
  title = "Schedule a Consultation",
  description = "Book a free 30-minute consultation to discuss your AI strategy, data engineering needs, or technology challenges."
}: CalendlyWidgetProps) {
  
  useEffect(() => {
    // Load Calendly widget script
    const script = document.createElement('script')
    script.src = 'https://assets.calendly.com/assets/external/widget.js'
    script.async = true
    document.body.appendChild(script)

    // Add Calendly event listener for booking completion
    const handleCalendlyEvent = (e: any) => {
      if (e.data.event === 'calendly.event_scheduled') {
        trackCalendlyBooking()
        // Calendly booking completed
      }
    }

    window.addEventListener('message', handleCalendlyEvent)

    return () => {
      document.body.removeChild(script)
      window.removeEventListener('message', handleCalendlyEvent)
    }
  }, [])

  const handleInlineBooking = () => {
    // Track when user interacts with booking widget
    if (typeof window !== 'undefined' && (window as any).Calendly) {
      (window as any).Calendly.initPopupWidget({ url })
    }
  }

  return (
    <div className={`glass p-8 rounded-2xl border border-white/10 relative overflow-hidden ${className}`}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-ai-green/5 via-transparent to-ai-blue/5 opacity-50" />
      <div className="absolute top-4 right-4 w-20 h-20 bg-ai-green/10 rounded-full blur-xl" />
      <div className="absolute bottom-4 left-4 w-16 h-16 bg-ai-blue/10 rounded-full blur-xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-6 h-6 text-ai-green" />
          <h2 className="text-3xl font-bold">{title}</h2>
        </div>

        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
          {description}
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ y: -2 }}
            className="flex items-center gap-3 p-4 glass rounded-lg border border-white/10"
          >
            <Calendar className="w-5 h-5 text-ai-green flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-1">Free Consultation</h4>
              <p className="text-sm text-muted-foreground">30-minute strategy session</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="flex items-center gap-3 p-4 glass rounded-lg border border-white/10"
          >
            <Video className="w-5 h-5 text-ai-blue flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-1">Video Call</h4>
              <p className="text-sm text-muted-foreground">Zoom or Google Meet</p>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ y: -2 }}
            className="flex items-center gap-3 p-4 glass rounded-lg border border-white/10"
          >
            <Clock className="w-5 h-5 text-ai-green flex-shrink-0" />
            <div>
              <h4 className="font-medium mb-1">Flexible Timing</h4>
              <p className="text-sm text-muted-foreground">Multiple time zones</p>
            </div>
          </motion.div>
        </div>

        {/* Calendly Embed */}
        <div className="bg-background/50 rounded-xl border border-white/20 overflow-hidden">
          <div 
            className="calendly-inline-widget" 
            data-url={url}
            style={{ minWidth: '320px', height: '600px' }}
            onClick={handleInlineBooking}
          />
        </div>

        {/* Alternative CTA Button */}
        <div className="mt-6 text-center">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleInlineBooking}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:from-ai-blue hover:to-ai-green transition-all"
          >
            <Calendar className="w-5 h-5" />
            Schedule Your Consultation
          </motion.button>
          <p className="text-sm text-muted-foreground mt-2">
            No commitment required • Instant confirmation
          </p>
        </div>
      </div>
    </div>
  )
}