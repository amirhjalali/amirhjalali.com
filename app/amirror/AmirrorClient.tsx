'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Camera, CameraOff, Mic, MicOff, Volume2, VolumeX, Send,
  Share2, Check, Loader2, RotateCcw, Eye
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'amirror'
  content: string
  timestamp: Date
  imageData?: string
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
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Chat state
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initial greeting
  const [hasGreeted, setHasGreeted] = useState(false)

  // Show conversation panel
  const [showConversation, setShowConversation] = useState(false)

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

    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)

    return canvas.toDataURL('image/jpeg', 0.8)
  }, [])

  // Speech recognition
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // Text-to-speech with ElevenLabs
  const speak = useCallback(async (text: string) => {
    if (!voiceEnabled) return

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    setIsSpeaking(true)

    try {
      const response = await fetch('/api/amirror/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        setIsSpeaking(false)
        return
      }

      const contentType = response.headers.get('content-type')
      if (!contentType?.includes('audio')) {
        setIsSpeaking(false)
        return
      }

      const audioBlob = await response.blob()
      if (audioBlob.size === 0) {
        setIsSpeaking(false)
        return
      }

      const audioUrl = URL.createObjectURL(audioBlob)
      const audio = new Audio(audioUrl)
      audioRef.current = audio

      audio.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        audioRef.current = null
      }

      audio.onerror = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        audioRef.current = null
      }

      await audio.play()
    } catch {
      setIsSpeaking(false)
    }
  }, [voiceEnabled])

  // Send message to Amirror
  const handleSend = useCallback(async (text?: string) => {
    const messageText = text || inputText.trim()
    if (!messageText && !cameraEnabled) return
    if (isLoading) return

    setIsLoading(true)
    setInputText('')
    setShowConversation(true)

    const imageData = cameraEnabled ? captureFrame() : null

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText || '(Gazing into the mirror...)',
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

      speak(data.response)
    } catch (error) {
      console.error('Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'amirror',
        content: "The spirits are restless... Try again, mortal.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [inputText, cameraEnabled, captureFrame, messages, speak, isLoading])

  // Initial greeting
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (cameraEnabled && !hasGreeted) {
      setHasGreeted(true)
      setTimeout(() => {
        handleSend('Amirror, Amirror on the wall, who is the fairest of them all?')
      }, 1500)
    }
  }, [cameraEnabled, hasGreeted])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Cleanup
  useEffect(() => {
    return () => {
      stopCamera()
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (audioRef.current) {
        audioRef.current.pause()
      }
    }
  }, [stopCamera])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleShare = async () => {
    const conversationText = messages
      .map(m => `${m.role === 'user' ? 'You' : 'Amirror'}: ${m.content}`)
      .join('\n\n')

    const shareText = `My consultation with The Amirror:\n\n${conversationText}\n\nFace the truth: ${window.location.href}`

    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({
          title: 'My Amirror Consultation',
          text: shareText
        })
        return
      } catch {
        // Fall through to copy
      }
    }

    await copyToClipboard(shareText)
  }

  const clearConversation = () => {
    setMessages([])
    setHasGreeted(false)
    setShowConversation(false)
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] overflow-x-hidden">
      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main content - centered */}
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-light tracking-[0.2em] mb-2">
            AMIRROR
          </h1>
          <p className="text-[#666666] text-xs tracking-[0.3em] uppercase font-mono">
            Amirror, Amirror on the wall...
          </p>
        </motion.div>

        {/* The Mirror */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative mx-auto"
        >
          {/* Mirror frame */}
          <div className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-4 bg-white/5 blur-2xl rounded-3xl" />

            {/* Frame border */}
            <div className="relative p-2 md:p-3 bg-gradient-to-b from-white/10 via-white/5 to-white/10 rounded-2xl">
              <div className="absolute inset-0 rounded-2xl border border-white/20" />

              {/* Inner frame */}
              <div className="relative p-1 bg-[#0a0a0a] rounded-xl">
                {/* The mirror glass */}
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-b from-[#111] via-[#0a0a0a] to-[#111]">
                  {/* Video element */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`absolute inset-0 w-full h-full object-cover transform scale-x-[-1] transition-opacity duration-700 ${
                      cameraEnabled ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  {/* Camera off state */}
                  {!cameraEnabled && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        animate={{
                          boxShadow: ['0 0 30px rgba(255,255,255,0.05)', '0 0 60px rgba(255,255,255,0.1)', '0 0 30px rgba(255,255,255,0.05)']
                        }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center bg-black/50 mb-6"
                      >
                        <Eye className="w-10 h-10 text-[#666666]" />
                      </motion.div>
                      <p className="text-[#666666] text-sm tracking-widest uppercase font-mono">
                        {cameraError || 'Gaze into the mirror'}
                      </p>
                      <p className="text-[#444444] text-xs mt-2 font-mono">
                        if you dare...
                      </p>
                    </div>
                  )}

                  {/* Glass reflection effect */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/[0.02] to-transparent" />
                    <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
                  </div>

                  {/* Speaking indicator */}
                  <AnimatePresence>
                    {isSpeaking && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="absolute bottom-4 left-4 right-4"
                      >
                        <div className="bg-black/90 backdrop-blur rounded-lg p-3 border border-white/10">
                          <div className="flex items-center justify-center gap-2">
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="w-1 bg-white rounded-full"
                                  animate={{ height: [6, 16, 6] }}
                                  transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.08 }}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-[#888888] font-mono ml-2">
                              Speaking...
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Listening indicator */}
                  <AnimatePresence>
                    {isListening && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2"
                      >
                        <div className="flex items-center gap-2 bg-black/90 px-4 py-2 rounded-full border border-white/10">
                          <motion.div
                            className="w-2 h-2 bg-white rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          <span className="text-xs text-[#888888] font-mono">
                            Listening...
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={cameraEnabled ? stopCamera : startCamera}
            className={`p-4 rounded-full border transition-all duration-300 ${
              cameraEnabled
                ? 'bg-white text-black border-white'
                : 'bg-transparent border-white/20 text-[#888888] hover:border-white/40'
            }`}
          >
            {cameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isListening ? stopListening : startListening}
            disabled={isLoading}
            className={`p-4 rounded-full border transition-all duration-300 ${
              isListening
                ? 'bg-white text-black border-white'
                : 'bg-transparent border-white/20 text-[#888888] hover:border-white/40 disabled:opacity-50'
            }`}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-4 rounded-full border transition-all duration-300 ${
              voiceEnabled
                ? 'bg-transparent border-white/30 text-[#EAEAEA]'
                : 'bg-transparent border-white/10 text-[#666666]'
            }`}
          >
            {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSend()}
            disabled={isLoading || (!inputText.trim() && !cameraEnabled)}
            className="p-4 rounded-full bg-white text-black border border-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
          </motion.button>
        </div>

        {/* Text input */}
        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask the mirror..."
            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-full focus:outline-none focus:border-white/30 text-sm text-[#EAEAEA] placeholder:text-[#666666] font-mono"
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            disabled={isLoading || !inputText.trim()}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all disabled:opacity-40"
          >
            <Send className="w-4 h-4 text-[#888888]" />
          </button>
        </div>

        {/* Conversation - Below mirror */}
        <AnimatePresence>
          {(showConversation || messages.length > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                <h2 className="text-xs tracking-[0.2em] uppercase text-[#666666] font-mono">
                  The Consultation
                </h2>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <>
                      <button
                        onClick={handleShare}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        {copied ? <Check className="w-4 h-4 text-[#EAEAEA]" /> : <Share2 className="w-4 h-4 text-[#666666]" />}
                      </button>
                      <button
                        onClick={clearConversation}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <RotateCcw className="w-4 h-4 text-[#666666]" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : ''}`}>
                        {message.imageData && (
                          <div className="mb-2 rounded-lg overflow-hidden border border-white/10 max-w-[120px]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={message.imageData} alt="Captured" className="w-full" />
                          </div>
                        )}
                        <div
                          className={`px-4 py-3 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-white/10 rounded-br-sm'
                              : 'bg-white/5 rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm leading-relaxed text-[#EAEAEA]/90">
                            {message.content}
                          </p>
                        </div>
                        <p className={`text-[10px] text-[#666666] mt-1 font-mono ${
                          message.role === 'user' ? 'text-right' : ''
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="px-4 py-3 bg-white/5 rounded-2xl rounded-bl-sm">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 text-[#888888] animate-spin" />
                        <span className="text-sm text-[#888888]">
                          Analyzing...
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <p className="text-center text-[#444444] text-xs mt-12 font-mono tracking-wider">
          Truth has no mercy
        </p>
      </div>
    </div>
  )
}
