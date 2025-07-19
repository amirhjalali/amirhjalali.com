'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import VoiceRecorder from '@/components/VoiceRecorder'
import Link from 'next/link'
import { saveArticle } from '@/lib/articles'
import { useRouter } from 'next/navigation'

interface GeneratedArticle {
  title: string
  content: string
  excerpt: string
  tags: string[]
  imageUrl?: string
  transcription?: string
  metadata: {
    style: string
    length: string
    generatedAt: string
    wordCount: number
    readingTime: number
  }
}

export default function GeneratePage() {
  const router = useRouter()
  const [mode, setMode] = useState<'voice' | 'text'>('voice')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedArticle, setGeneratedArticle] = useState<GeneratedArticle | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState({
    style: 'professional',
    length: 'medium'
  })
  const [textPrompt, setTextPrompt] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleVoiceRecording = async (audioBlob: Blob) => {
    await generateArticle(audioBlob, 'voice')
  }

  const handleTextSubmit = async () => {
    if (!textPrompt.trim()) return
    await generateArticle(textPrompt, 'text')
  }

  const generateArticle = async (input: Blob | string, type: 'voice' | 'text') => {
    setIsGenerating(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('type', type)
      formData.append('style', settings.style)
      formData.append('length', settings.length)

      if (type === 'voice' && input instanceof Blob) {
        formData.append('audioFile', input, 'recording.webm')
      } else if (type === 'text' && typeof input === 'string') {
        formData.append('prompt', input)
      }

      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate article')
      }

      setGeneratedArticle(data.article)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsGenerating(false)
    }
  }

  const resetGenerator = () => {
    setGeneratedArticle(null)
    setError(null)
    setTextPrompt('')
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      // Could add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const saveGeneratedArticle = async () => {
    if (!generatedArticle) return
    
    setIsSaving(true)
    try {
      const savedArticle = saveArticle({
        title: generatedArticle.title,
        content: generatedArticle.content,
        excerpt: generatedArticle.excerpt,
        tags: generatedArticle.tags,
        imageUrl: generatedArticle.imageUrl,
        author: 'AI Assistant',
        aiGenerated: true,
        metadata: generatedArticle.metadata
      })
      
      // Redirect to the saved article
      router.push(`/thoughts/${savedArticle.id}`)
    } catch (err) {
      setError('Failed to save article')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
      
      <div className="relative z-10 px-6 py-20 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-space font-black mb-6">
            <span className="text-gradient">AI Content Studio</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Transform your ideas into compelling articles using advanced AI technology
          </p>
        </motion.div>

        {!generatedArticle ? (
          <div className="max-w-4xl mx-auto">
            {/* Mode Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center gap-4 mb-8"
            >
              <button
                onClick={() => setMode('voice')}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  mode === 'voice'
                    ? 'bg-gradient-to-r from-ai-green to-ai-blue text-black'
                    : 'glass border border-white/20 text-gray-300 hover:border-ai-green/50'
                }`}
              >
                🎤 Voice Recording
              </button>
              <button
                onClick={() => setMode('text')}
                className={`px-6 py-3 rounded-full font-medium transition-all ${
                  mode === 'text'
                    ? 'bg-gradient-to-r from-ai-green to-ai-blue text-black'
                    : 'glass border border-white/20 text-gray-300 hover:border-ai-green/50'
                }`}
              >
                ✍️ Text Input
              </button>
            </motion.div>

            {/* Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass p-6 rounded-2xl border border-white/10 mb-8"
            >
              <h3 className="text-lg font-semibold mb-4">Article Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Writing Style</label>
                  <select
                    value={settings.style}
                    onChange={(e) => setSettings(prev => ({ ...prev, style: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-ai-green/50 focus:outline-none"
                  >
                    <option value="professional">Professional</option>
                    <option value="technical">Technical</option>
                    <option value="casual">Casual</option>
                    <option value="creative">Creative</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Article Length</label>
                  <select
                    value={settings.length}
                    onChange={(e) => setSettings(prev => ({ ...prev, length: e.target.value }))}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-ai-green/50 focus:outline-none"
                  >
                    <option value="short">Short (400-600 words)</option>
                    <option value="medium">Medium (800-1200 words)</option>
                    <option value="long">Long (1500-2500 words)</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Input Area */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
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
                      onRecordingStart={() => setError(null)}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="text"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass p-8 rounded-2xl border border-white/10"
                  >
                    <h3 className="text-2xl font-bold mb-4">Text Input</h3>
                    <p className="text-gray-400 mb-6">
                      Describe your article idea, key points, or provide an outline
                    </p>
                    <textarea
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      placeholder="Enter your article idea, key points, or topic here..."
                      className="w-full h-40 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-ai-green/50 focus:outline-none resize-none"
                    />
                    <button
                      onClick={handleTextSubmit}
                      disabled={!textPrompt.trim() || isGenerating}
                      className="mt-4 px-8 py-4 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                    >
                      Generate Article
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Error Display */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center"
                >
                  <p className="text-red-400">{error}</p>
                  <button
                    onClick={() => setError(null)}
                    className="mt-2 text-red-300 hover:text-red-200 text-sm"
                  >
                    Dismiss
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading State */}
            <AnimatePresence>
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
                >
                  <div className="glass p-8 rounded-2xl border border-white/20 text-center">
                    <div className="w-16 h-16 border-4 border-ai-green border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Generating Your Article</h3>
                    <p className="text-gray-400">
                      AI is processing your input and creating content...
                    </p>
                    <div className="mt-4 text-sm text-gray-500">
                      This may take 30-60 seconds
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          /* Generated Article Display */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Article Header */}
            <div className="glass p-8 rounded-2xl border border-white/10 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">{generatedArticle.title}</h2>
                  <p className="text-gray-400 mb-4">{generatedArticle.excerpt}</p>
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>📊 {generatedArticle.metadata.wordCount} words</span>
                    <span>⏱️ {generatedArticle.metadata.readingTime} min read</span>
                    <span>🎨 {generatedArticle.metadata.style}</span>
                  </div>
                </div>
                
                <button
                  onClick={resetGenerator}
                  className="px-4 py-2 glass border border-white/20 rounded-lg hover:border-ai-green/50 transition-all"
                >
                  Generate New
                </button>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {generatedArticle.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-ai-green/20 text-ai-green rounded-full text-sm">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={saveGeneratedArticle}
                  disabled={isSaving}
                  className="px-6 py-3 bg-gradient-to-r from-ai-green to-ai-blue text-black font-semibold rounded-full hover:scale-105 transition-transform disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save & Publish'}
                </button>
                <button
                  onClick={() => copyToClipboard(generatedArticle.content)}
                  className="px-6 py-3 glass border border-white/20 rounded-full hover:border-ai-green/50 transition-all"
                >
                  Copy Content
                </button>
                <button
                  onClick={() => copyToClipboard(`# ${generatedArticle.title}\n\n${generatedArticle.content}`)}
                  className="px-6 py-3 glass border border-white/20 rounded-full hover:border-ai-green/50 transition-all"
                >
                  Copy with Title
                </button>
              </div>
            </div>

            {/* Article Content */}
            <div className="glass p-8 rounded-2xl border border-white/10 prose prose-invert max-w-none">
              <div 
                className="article-content"
                dangerouslySetInnerHTML={{ 
                  __html: generatedArticle.content
                    .replace(/\n/g, '<br/>')
                    .replace(/## (.*)/g, '<h2>$1</h2>')
                    .replace(/### (.*)/g, '<h3>$1</h3>')
                    .replace(/# (.*)/g, '<h1>$1</h1>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                }} 
              />
            </div>

            {/* Transcription (if from voice) */}
            {generatedArticle.transcription && (
              <div className="mt-8 glass p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-semibold mb-3">Original Transcription</h3>
                <p className="text-gray-400 text-sm">{generatedArticle.transcription}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}