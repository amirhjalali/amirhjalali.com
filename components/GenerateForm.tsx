'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Loader2, Wand2, Mic, PenTool, Sparkles } from 'lucide-react'
import VoiceRecorder from '@/components/VoiceRecorder'
import { cn } from '@/lib/utils'

const formSchema = z.object({
  prompt: z.string().min(10, {
    message: "Please provide at least 10 characters to generate content.",
  }),
  style: z.string({
    required_error: "Please select a writing style.",
  }),
  length: z.string({
    required_error: "Please select an article length.",
  }),
})

interface GenerateFormProps {
  onGenerate: (data: any, type: 'voice' | 'text') => Promise<void>
  isGenerating: boolean
}

export default function GenerateForm({ onGenerate, isGenerating }: GenerateFormProps) {
  const [mode, setMode] = useState<'voice' | 'text'>('voice')
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      style: "professional",
      length: "medium",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    await onGenerate(values, 'text')
  }

  const handleVoiceRecording = async (audioBlob: Blob) => {
    const settings = {
      style: form.getValues('style'),
      length: form.getValues('length'),
      audioBlob
    }
    await onGenerate(settings, 'voice')
  }

  return (
    <Card className="glass border-white/10 p-8">
      <div className="space-y-6">
        {/* Mode Selection */}
        <Tabs value={mode} onValueChange={(value) => setMode(value as 'voice' | 'text')}>
          <TabsList className="grid w-full grid-cols-2 bg-white/5">
            <TabsTrigger value="voice" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-ai-green data-[state=active]:to-ai-blue data-[state=active]:text-black">
              <Mic className="w-4 h-4 mr-2" />
              Voice Recording
            </TabsTrigger>
            <TabsTrigger value="text" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-ai-green data-[state=active]:to-ai-blue data-[state=active]:text-black">
              <PenTool className="w-4 h-4 mr-2" />
              Text Input
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Settings */}
            <div className="space-y-4 p-6 bg-white/5 rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-ai-green" />
                <h3 className="text-lg font-semibold">Article Settings</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="style"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Writing Style</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 focus:border-ai-green/50">
                            <SelectValue placeholder="Select a style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-background border-white/10">
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="technical">Technical</SelectItem>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="creative">Creative</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The tone and style of your article
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="length"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Article Length</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10 focus:border-ai-green/50">
                            <SelectValue placeholder="Select length" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-background border-white/10">
                          <SelectItem value="short">Short (400-600 words)</SelectItem>
                          <SelectItem value="medium">Medium (800-1200 words)</SelectItem>
                          <SelectItem value="long">Long (1500-2500 words)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Target word count for the article
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Input Area */}
            <AnimatePresence mode="wait">
              {mode === 'voice' ? (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <VoiceRecorder 
                    onRecordingComplete={handleVoiceRecording}
                    onRecordingStart={() => {}}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="text"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="prompt"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xl font-semibold">Article Idea</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your article idea, key points, or provide an outline. Be as detailed as possible for better results..."
                            className="bg-white/5 border-white/10 focus:border-ai-green/50 min-h-[200px] resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The more detail you provide, the better the AI can understand your vision
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className={cn(
                      "w-full relative overflow-hidden",
                      "bg-gradient-to-r from-ai-green to-ai-blue text-black",
                      "hover:from-ai-blue hover:to-ai-green",
                      "transition-all duration-300"
                    )}
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Article...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Article
                      </>
                    )}
                    
                    {/* Animated gradient overlay */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      initial={{ x: '-100%' }}
                      whileHover={{ x: '100%' }}
                      transition={{ duration: 0.6 }}
                    />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </Form>
      </div>
    </Card>
  )
}