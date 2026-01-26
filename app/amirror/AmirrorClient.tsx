'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, CameraOff, Mic, MicOff, Volume2, VolumeX, Send,
  Share2, Copy, Check, Loader2, MessageSquare, Sparkles,
  RotateCcw, X
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'amirror'
  content: string
  timestamp: Date
  imageData?: string // Base64 image when user sends with camera
}

export default function AmirrorClient() {
  // Camera state
  const [cameraEnabled, setCameraEnabled] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // Voice state
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initial greeting
  const [hasGreeted, setHasGreeted] = useState(false)

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      setCameraError(null)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
        setCameraEnabled(true)
      }
    } catch (error: any) {
      console.error('Camera error:', error)
      setCameraError(error.message || 'Could not access camera')
      setCameraEnabled(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setCameraEnabled(false)
  }, [])

  // Capture current frame
  const captureFrame = useCallback((): string | null => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    if (!ctx) return null

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Mirror the image
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)

    return canvas.toDataURL('image/jpeg', 0.8)
  }, [])

  // Speech recognition
  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in your browser')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputText(transcript)
      // Auto-send after voice input
      handleSend(transcript)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
  }, [])

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }, [])

  // Text-to-speech
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 0.8 // Slightly lower pitch for dramatic effect
    utterance.volume = 1

    // Try to get a good voice
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v =>
      v.name.includes('Daniel') ||
      v.name.includes('Google UK English Male') ||
      v.name.includes('Male')
    ) || voices[0]

    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }, [voiceEnabled])

  // Send message to Amirror
  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || inputText.trim()
    if (!messageText && !cameraEnabled) return
    if (isLoading) return

    setIsLoading(true)
    setInputText('')

    // Capture image if camera is enabled
    const imageData = cameraEnabled ? captureFrame() : null

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText || '(Looking in the mirror...)',
      timestamp: new Date(),
      imageData: imageData || undefined
    }
    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch('/api/amirror', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          imageData,
          conversationHistory: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      })

      if (!response.ok) throw new Error('Failed to get response')

      const data = await response.json()

      const amirrorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'amirror',
        content: data.response,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, amirrorMessage])

      // Speak the response
      speak(data.response)
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'amirror',
        content: "Even my magical powers have limits. Try again, mortal.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [inputText, cameraEnabled, captureFrame, messages, speak, isLoading])

  // Initial greeting when camera starts
  useEffect(() => {
    if (cameraEnabled && !hasGreeted) {
      setHasGreeted(true)
      setTimeout(() => {
        handleSend('Amirror, Amirror on the wall, who is the fairest of them all?')
      }, 1500)
    }
  }, [cameraEnabled, hasGreeted])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Load voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices()
    }
  }, [])

  // Cleanup
  useEffect(() => {
    return () => {
      stopCamera()
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      window.speechSynthesis?.cancel()
    }
  }, [stopCamera])

  // Copy to clipboard helper
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Share conversation
  const handleShare = async () => {
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'You' : 'Amirror'}: ${m.content}`)
      .join('\n\n')

    const shareText = `My conversation with Amirror:\n\n${conversationText}\n\nTry it: ${window.location.href}`

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'My Amirror Conversation',
          text: shareText
        })
        return
      } catch {
        // User cancelled or error - fall through to copy
      }
    }

    // Fallback to copy
    await copyToClipboard(shareText)
  }

  const clearConversation = () => {
    setMessages([])
    setHasGreeted(false)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA]">
      {/* Hidden canvas for capturing frames */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-light mb-2">
            Amirror
          </h1>
          <p className="text-[#888888] font-mono text-sm">
            Amirror, Amirror on the wall...
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Mirror Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Mirror Frame */}
            <div className="relative aspect-[4/3] bg-black rounded-2xl border-4 border-white/10 overflow-hidden">
              {cameraEnabled ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-b from-white/5 to-transparent">
                  <div className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center mb-4">
                    <Camera className="w-10 h-10 text-[#888888]" />
                  </div>
                  <p className="text-[#888888] text-sm font-mono">
                    {cameraError || 'Enable camera to gaze into the mirror'}
                  </p>
                </div>
              )}

              {/* Mirror overlay effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/5 pointer-events-none" />

              {/* Speaking indicator */}
              <AnimatePresence>
                {isSpeaking && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/10"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            className="w-1 h-4 bg-white rounded-full"
                            animate={{ scaleY: [1, 1.5, 1] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                          />
                        ))}
                      </div>
                      <span className="text-xs font-mono text-[#888888]">Amirror speaks...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={cameraEnabled ? stopCamera : startCamera}
                className={`p-3 rounded-xl border transition-all ${
                  cameraEnabled
                    ? 'bg-white text-black border-white hover:bg-[#EAEAEA]'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {cameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </button>

              <button
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className={`p-3 rounded-xl border transition-all ${
                  isListening
                    ? 'bg-white text-black border-white animate-pulse'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                title={isListening ? 'Stop listening' : 'Speak to the mirror'}
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-3 rounded-xl border transition-all ${
                  voiceEnabled
                    ? 'bg-white/5 border-white/20'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>

              <button
                onClick={() => handleSend()}
                disabled={isLoading || (!inputText.trim() && !cameraEnabled)}
                className="p-3 rounded-xl bg-white text-black border border-white hover:bg-[#EAEAEA] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                title="Ask the mirror"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              </button>
            </div>

            {/* Text input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask the mirror anything..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-white/30 text-sm placeholder:text-[#888888]/50"
                disabled={isLoading}
              />
              <button
                onClick={() => handleSend()}
                disabled={isLoading || !inputText.trim()}
                className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </motion.div>

          {/* Conversation Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {/* Conversation header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#888888]" />
                <span className="text-sm font-mono uppercase tracking-widest text-[#888888]">
                  Conversation
                </span>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <>
                    <button
                      onClick={handleShare}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      title="Share conversation"
                    >
                      {copied ? <Check className="w-4 h-4 text-[#EAEAEA]" /> : <Share2 className="w-4 h-4 text-[#888888]" />}
                    </button>
                    <button
                      onClick={clearConversation}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      title="Clear conversation"
                    >
                      <RotateCcw className="w-4 h-4 text-[#888888]" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="h-[500px] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-4">
                    <Sparkles className="w-6 h-6 text-[#888888]" />
                  </div>
                  <p className="text-[#888888] text-sm mb-2">
                    The mirror awaits your question
                  </p>
                  <p className="text-[#888888]/60 text-xs font-mono">
                    Enable your camera and speak or type
                  </p>
                </div>
              ) : (
                messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : ''}`}>
                      {message.imageData && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-white/10 max-w-[200px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={message.imageData} alt="Captured" className="w-full" />
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-white text-black rounded-br-sm'
                            : 'bg-white/5 border border-white/10 rounded-bl-sm'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className={`text-[10px] text-[#888888]/60 mt-1 font-mono ${
                        message.role === 'user' ? 'text-right' : ''
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}

              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#888888]" />
                      <span className="text-sm text-[#888888]">The mirror contemplates...</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        </div>

        {/* Footer note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-[#888888]/40 text-xs font-mono mt-8"
        >
          The Amirror sees all, judges all, and fears nothing.
        </motion.p>
      </div>
    </div>
  )
}
