'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import {
  Camera, CameraOff, Mic, MicOff, Volume2, VolumeX, Send,
  Share2, Check, Loader2, RotateCcw, Eye, Wand2
} from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'amirror'
  content: string
  timestamp: Date
  imageData?: string
}

// Check if frame image exists
const FRAME_IMAGE_PATH = '/images/amirror-frame.png'

// Floating particle component
function FloatingParticle({ delay = 0 }: { delay?: number }) {
  return (
    <motion.div
      className="absolute w-1 h-1 bg-white/20 rounded-full"
      initial={{
        x: Math.random() * 100 - 50,
        y: 100,
        opacity: 0,
        scale: 0
      }}
      animate={{
        y: -100,
        opacity: [0, 0.6, 0],
        scale: [0, 1, 0.5]
      }}
      transition={{
        duration: 8 + Math.random() * 4,
        repeat: Infinity,
        delay: delay,
        ease: "easeOut"
      }}
      style={{
        left: `${Math.random() * 100}%`,
        filter: 'blur(0.5px)'
      }}
    />
  )
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

  // Frame image state
  const [frameExists, setFrameExists] = useState(false)
  const [isGeneratingFrame, setIsGeneratingFrame] = useState(false)

  // Check if frame image exists on mount
  useEffect(() => {
    const checkFrame = async () => {
      try {
        const res = await fetch(FRAME_IMAGE_PATH, { method: 'HEAD' })
        setFrameExists(res.ok)
      } catch {
        setFrameExists(false)
      }
    }
    checkFrame()
  }, [])

  // Generate frame image
  const generateFrame = useCallback(async () => {
    if (isGeneratingFrame) return
    setIsGeneratingFrame(true)
    try {
      const response = await fetch('/api/amirror/generate-frame', { method: 'POST' })
      if (response.ok) {
        setFrameExists(true)
      } else {
        console.error('Failed to generate frame')
      }
    } catch (error) {
      console.error('Frame generation error:', error)
    } finally {
      setIsGeneratingFrame(false)
    }
  }, [isGeneratingFrame])

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
  const audioRef = useRef<HTMLAudioElement | null>(null)

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
        throw new Error('Speech synthesis failed')
      }

      // Create audio from response
      const audioBlob = await response.blob()
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
    } catch (error) {
      console.error('TTS error:', error)
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
  }

  return (
    <div className="min-h-screen bg-[#050505] text-[#EAEAEA] overflow-hidden relative">
      {/* Hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_50%,rgba(0,0,0,0.8)_100%)]" />

        {/* Fog effect */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-white/5 via-transparent to-transparent"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <FloatingParticle key={i} delay={i * 0.5} />
          ))}
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6 md:py-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-6 md:mb-10"
        >
          <h1 className="text-5xl md:text-7xl font-serif font-light tracking-[0.15em] mb-3">
            <span className="text-[#EAEAEA] drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              AMIRROR
            </span>
          </h1>
          <p className="text-[#888888] text-sm md:text-base tracking-[0.3em] uppercase font-mono">
            Amirror, Amirror on the wall...
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr,380px] gap-6 md:gap-10 items-start">
          {/* Mirror Section */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="relative"
          >
            {/* THE ORNATE MIRROR FRAME */}
            <div className="relative mx-auto max-w-xl">
              {/* Outer glow */}
              <div className="absolute -inset-8 bg-gradient-to-b from-white/5 via-white/3 to-white/5 blur-xl rounded-full" />

              {/* Mirror frame with image */}
              <div className="relative">
                {/* Frame image overlay */}
                <div className="absolute -inset-6 md:-inset-10 pointer-events-none z-20">
                  {frameExists ? (
                    /* Use generated frame image */
                    <div className="absolute inset-0">
                      <Image
                        src={FRAME_IMAGE_PATH}
                        alt="Ornate mirror frame"
                        fill
                        className="object-contain"
                        priority
                      />
                    </div>
                  ) : (
                    /* Fallback CSS frame until image is generated */
                    <>
                      <div className="absolute inset-0 border-[12px] md:border-[16px] border-white/10 rounded-lg"
                           style={{
                             borderImage: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.15) 100%) 1',
                           }}
                      />
                      {/* Inner decorative border */}
                      <div className="absolute inset-3 border-2 border-white/5 rounded" />
                      {/* Corner accents */}
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/20" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/20" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/20" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/20" />
                    </>
                  )}
                </div>

                {/* The mirror glass */}
                <div className="relative aspect-[3/4] rounded overflow-hidden bg-gradient-to-b from-gray-900 via-black to-gray-900 border border-white/10">
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
                      {/* Mystical background */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(20,20,20,1)_0%,rgba(5,5,5,1)_100%)]" />

                      {/* Subtle shimmer */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />

                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative z-10 text-center px-8"
                      >
                        <motion.div
                          animate={{
                            boxShadow: ['0 0 20px rgba(255,255,255,0.1)', '0 0 40px rgba(255,255,255,0.2)', '0 0 20px rgba(255,255,255,0.1)']
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="w-20 h-20 mx-auto mb-6 rounded-full border border-white/20 flex items-center justify-center bg-black/50"
                        >
                          <Eye className="w-8 h-8 text-[#888888]" />
                        </motion.div>
                        <p className="text-[#888888] text-sm tracking-widest uppercase font-mono">
                          {cameraError || 'Gaze into the mirror'}
                        </p>
                        <p className="text-[#666666] text-xs mt-2 font-mono">
                          if you dare...
                        </p>
                      </motion.div>
                    </div>
                  )}

                  {/* Mirror glass effects */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Top reflection */}
                    <div className="absolute top-0 left-0 right-0 h-1/4 bg-gradient-to-b from-white/[0.03] to-transparent" />
                    {/* Edge highlight */}
                    <div className="absolute inset-0 rounded shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
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
                        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="w-1 bg-white rounded-full"
                                  animate={{ height: [8, 20, 8] }}
                                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-[#888888] tracking-widest uppercase font-mono">
                              The mirror speaks...
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
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute top-4 right-4"
                      >
                        <div className="flex items-center gap-2 bg-black/80 px-4 py-2 rounded-full border border-white/20">
                          <motion.div
                            className="w-2 h-2 bg-white rounded-full"
                            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                          />
                          <span className="text-xs text-[#888888] tracking-wider uppercase font-mono">
                            Listening
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={cameraEnabled ? stopCamera : startCamera}
                className={`p-4 rounded-full border-2 transition-all duration-300 ${
                  cameraEnabled
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-black/50 border-white/20 text-[#888888] hover:border-white/40 hover:text-[#EAEAEA]'
                }`}
                title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
              >
                {cameraEnabled ? <Camera className="w-5 h-5" /> : <CameraOff className="w-5 h-5" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                className={`p-4 rounded-full border-2 transition-all duration-300 ${
                  isListening
                    ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                    : 'bg-black/50 border-white/20 text-[#888888] hover:border-white/40 hover:text-[#EAEAEA] disabled:opacity-50'
                }`}
                title={isListening ? 'Stop listening' : 'Speak to the mirror'}
              >
                {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`p-4 rounded-full border-2 transition-all duration-300 ${
                  voiceEnabled
                    ? 'bg-black/50 border-white/30 text-[#EAEAEA]'
                    : 'bg-black/50 border-white/10 text-[#666666] hover:border-white/20'
                }`}
                title={voiceEnabled ? 'Mute voice' : 'Enable voice'}
              >
                {voiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend()}
                disabled={isLoading || (!inputText.trim() && !cameraEnabled)}
                className="p-4 rounded-full bg-white text-black border-2 border-white shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                title="Ask the mirror"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Eye className="w-5 h-5" />}
              </motion.button>
            </div>

            {/* Generate frame button (only show if no frame exists) */}
            {!frameExists && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-center mt-4"
              >
                <button
                  onClick={generateFrame}
                  disabled={isGeneratingFrame}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-all disabled:opacity-50 text-xs font-mono text-[#888888]"
                >
                  {isGeneratingFrame ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Generating ornate frame...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-3 h-3" />
                      Generate ornate mirror frame
                    </>
                  )}
                </button>
              </motion.div>
            )}

            {/* Text input */}
            <div className="flex gap-2 mt-4 max-w-xl mx-auto">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Speak your question to the mirror..."
                className="flex-1 px-5 py-3 bg-black/50 border border-white/10 rounded-full focus:outline-none focus:border-white/30 text-sm text-[#EAEAEA] placeholder:text-[#666666] transition-all font-mono"
                disabled={isLoading}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSend()}
                disabled={isLoading || !inputText.trim()}
                className="px-5 py-3 bg-black/50 border border-white/10 rounded-full hover:border-white/30 transition-all disabled:opacity-40"
              >
                <Send className="w-4 h-4 text-[#888888]" />
              </motion.button>
            </div>
          </motion.div>

          {/* Conversation Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="space-y-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-xs tracking-[0.2em] uppercase text-[#888888] font-mono">
                The Consultation
              </h2>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <>
                    <button
                      onClick={handleShare}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      title="Share"
                    >
                      {copied ? <Check className="w-4 h-4 text-[#EAEAEA]" /> : <Share2 className="w-4 h-4 text-[#888888]" />}
                    </button>
                    <button
                      onClick={clearConversation}
                      className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                      title="Clear"
                    >
                      <RotateCcw className="w-4 h-4 text-[#888888]" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="h-[500px] overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center mb-4"
                  >
                    <Eye className="w-6 h-6 text-[#666666]" />
                  </motion.div>
                  <p className="text-[#888888] text-sm mb-2 font-mono">
                    The mirror awaits
                  </p>
                  <p className="text-[#666666] text-xs font-mono">
                    Enable camera to receive your verdict
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
                    <div className={`max-w-[90%] ${message.role === 'user' ? 'order-2' : ''}`}>
                      {message.imageData && (
                        <div className="mb-2 rounded-lg overflow-hidden border border-white/10 max-w-[180px]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={message.imageData} alt="Captured" className="w-full" />
                        </div>
                      )}
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          message.role === 'user'
                            ? 'bg-white/10 border border-white/20 rounded-br-sm'
                            : 'bg-black/50 border border-white/5 rounded-bl-sm'
                        }`}
                      >
                        <p
                          className={`text-sm leading-relaxed ${
                            message.role === 'user' ? 'text-[#EAEAEA]' : 'text-[#EAEAEA]/80'
                          }`}
                        >
                          {message.content}
                        </p>
                      </div>
                      <p className={`text-[10px] text-[#666666] mt-1 font-mono ${
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
                  <div className="px-4 py-3 bg-black/50 border border-white/5 rounded-2xl rounded-bl-sm">
                    <div className="flex items-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      >
                        <Eye className="w-4 h-4 text-[#888888]" />
                      </motion.div>
                      <span className="text-sm text-[#888888] italic">
                        The mirror gazes back...
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="text-center text-[#666666] text-xs mt-10 tracking-widest uppercase font-mono"
        >
          Truth has no mercy. The mirror has no lies.
        </motion.p>
      </div>
    </div>
  )
}
