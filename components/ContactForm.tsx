'use client'

import { motion } from 'framer-motion'
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
import { Send, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackContactFormSubmit } from '@/lib/analytics'

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  projectType: z.string().min(1, {
    message: "Please select a project type.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
})

export default function ContactForm() {
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
    // Create mailto link with form data
    const subject = encodeURIComponent(`${values.projectType}: ${values.subject}`)
    const body = encodeURIComponent(
      `Name: ${values.name}\n` +
      `Email: ${values.email}\n` +
      `Project Type: ${values.projectType}\n\n` +
      `Message:\n${values.message}`
    )

    const mailtoLink = `mailto:amirhjalali@gmail.com?subject=${subject}&body=${body}`

    // Track form submission
    trackContactFormSubmit(values)

    // Open email client in new window
    window.open(mailtoLink, '_blank')
  }

  return (
    <div className="glass p-8 rounded-2xl border border-white/10 relative overflow-hidden">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-[#888888]" />
        <h2 className="text-2xl font-serif font-light">Send a Message</h2>
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
                      className="bg-white/5 border-white/10 focus:border-white/30 transition-colors"
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
                      className="bg-white/5 border-white/10 focus:border-white/30 transition-colors"
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-white/5 border-white/10 focus:border-white/30 transition-colors">
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
                    className="bg-white/5 border-white/10 focus:border-white/30 transition-colors"
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
                    className="bg-white/5 border-white/10 focus:border-white/30 transition-colors resize-none min-h-[150px]"
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
            className={cn(
              "w-full relative overflow-hidden",
              "bg-white text-black",
              "hover:bg-[#EAEAEA]",
              "transition-all duration-300 font-mono uppercase tracking-widest"
            )}
            size="lg"
          >
            <Send className="mr-2 h-4 w-4" />
            Send Message

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
