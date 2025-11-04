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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Send, Sparkles, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackContactFormSubmit } from '@/lib/analytics'

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  projectType: z.string({
    required_error: "Please select a project type.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      projectType: "",
      subject: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      // Create mailto link with form data
      const subject = encodeURIComponent(`${values.projectType}: ${values.subject}`)
      const body = encodeURIComponent(
        `Name: ${values.name}\n` +
        `Email: ${values.email}\n` +
        `Project Type: ${values.projectType}\n\n` +
        `Message:\n${values.message}`
      )

      const mailtoLink = `mailto:hello@amirhjalali.com?subject=${subject}&body=${body}`

      // Open email client
      window.location.href = mailtoLink

      // Track successful form submission
      trackContactFormSubmit(values)

      setIsSubmitting(false)
      setIsSuccess(true)

      // Reset form after 3 seconds
      setTimeout(() => {
        form.reset()
        setIsSuccess(false)
      }, 3000)
    } catch {
      // Form submission error
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass p-8 rounded-2xl border border-white/10 relative overflow-hidden">
      {/* Success overlay */}
      <motion.div
        initial={false}
        animate={{
          opacity: isSuccess ? 1 : 0,
          scale: isSuccess ? 1 : 0.8,
          pointerEvents: isSuccess ? 'all' : 'none'
        }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-background/95 backdrop-blur-lg z-50 flex items-center justify-center"
      >
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-ai-green mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
          <p className="text-muted-foreground">I'll get back to you soon.</p>
        </div>
      </motion.div>

      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-ai-green" />
        <h2 className="text-2xl font-bold">Send a Message</h2>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Your name" 
                      className="bg-white/5 border-white/10 focus:border-ai-green/50 transition-colors"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input 
                      type="email"
                      placeholder="your@email.com" 
                      className="bg-white/5 border-white/10 focus:border-ai-green/50 transition-colors"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="projectType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/10 focus:border-ai-green/50 transition-colors">
                      <SelectValue placeholder="Select a project type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-background border-white/10">
                    <SelectItem value="general">General Inquiry</SelectItem>
                    <SelectItem value="collaboration">Collaboration</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="speaking">Speaking Opportunity</SelectItem>
                    <SelectItem value="press">Press Inquiry</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subject</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="What's this about?" 
                    className="bg-white/5 border-white/10 focus:border-ai-green/50 transition-colors"
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  A brief summary of your inquiry
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Tell me about your project or question..."
                    className="bg-white/5 border-white/10 focus:border-ai-green/50 transition-colors resize-none min-h-[150px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Provide as much detail as possible
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full relative overflow-hidden",
              "bg-gradient-to-r from-ai-green to-ai-blue text-black",
              "hover:from-ai-blue hover:to-ai-green",
              "transition-all duration-300"
            )}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Message
              </>
            )}
            
            {/* Animated gradient overlay on hover */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.6 }}
            />
          </Button>
        </form>
      </Form>
    </div>
  )
}
