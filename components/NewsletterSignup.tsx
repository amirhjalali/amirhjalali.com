'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Loader2, Mail, CheckCircle, Sparkles } from 'lucide-react'
import { trackEmailSubscription } from '@/lib/analytics'

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

interface NewsletterSignupProps {
  className?: string
  title?: string
  description?: string
}

export default function NewsletterSignup({ 
  className = "", 
  title = "Stay Updated",
  description = "Get insights on AI trends, programming paradigms, and technology innovation directly in your inbox."
}: NewsletterSignupProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(_values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    try {
      // Simulate newsletter signup
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Newsletter signup successful
      
      // Track successful email subscription
      trackEmailSubscription()
      
      setIsSubmitting(false)
      setIsSuccess(true)
      
      // Reset form after 3 seconds
      setTimeout(() => {
        form.reset()
        setIsSuccess(false)
      }, 3000)
    } catch {
      // Newsletter signup error
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`glass p-6 rounded-2xl border border-white/10 relative overflow-hidden ${className}`}>
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-ai-green/5 via-transparent to-ai-blue/5 opacity-50" />
      <div className="absolute top-4 right-4 w-16 h-16 bg-ai-green/10 rounded-full blur-xl" />
      
      {/* Success overlay */}
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10"
        >
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-ai-green mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Welcome to the newsletter!</h3>
            <p className="text-muted-foreground">You'll hear from me soon with AI insights and updates.</p>
          </div>
        </motion.div>
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-ai-green" />
          <h3 className="text-xl font-bold">{title}</h3>
        </div>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="Enter your email address"
                        {...field}
                        className="pr-12 bg-background/50 border-white/20 focus:border-ai-green/50"
                      />
                      <Mail className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              disabled={isSubmitting || isSuccess}
              className="w-full bg-gradient-to-r from-ai-green to-ai-blue text-black hover:from-ai-blue hover:to-ai-green font-medium transition-all"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : isSuccess ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Subscribed!
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Subscribe to Newsletter
                </>
              )}
            </Button>
          </form>
        </Form>

        <p className="text-xs text-muted-foreground mt-3 text-center">
          No spam, unsubscribe at any time. I respect your privacy.
        </p>
      </div>
    </div>
  )
}