'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Loader2, MessageSquare, X, Sparkles, BookOpen, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import Link from 'next/link'

interface Source {
  noteId: string
  title: string | null
  excerpt?: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  sources?: Source[]
}

interface NotesChatPanelProps {
  isOpen: boolean
  onClose: () => void
}

const SUGGESTED_QUESTIONS = [
  'What are the key themes in my notes?',
  'Summarize my recent learnings',
  'What topics should I review?',
]

export default function NotesChatPanel({ isOpen, onClose }: NotesChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen) {
      // Small delay to allow panel animation to complete
      const timer = setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Handle escape key to close panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const sendMessage = async (messageText?: string) => {
    const userMessage = (messageText || input).trim()
    if (!userMessage || isLoading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const response = await fetch('/api/notes/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: userMessage }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || data.response,
          sources: data.sources || [],
        },
      ])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const handleSuggestionClick = (question: string) => {
    setInput(question)
    sendMessage(question)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] lg:w-[480px] z-50 flex flex-col bg-[#0a0a0a]/95 backdrop-blur-md border-l border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-xl">
                  <Sparkles className="w-5 h-5 text-[#EAEAEA]" />
                </div>
                <div>
                  <h3 className="text-base font-medium text-[#EAEAEA]">Ask your notes</h3>
                  <p className="text-xs text-[#888888]">AI-powered knowledge search</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                aria-label="Close chat panel"
              >
                <X className="w-5 h-5 text-[#888888] hover:text-[#EAEAEA]" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="p-4 bg-white/5 rounded-2xl mb-5">
                    <MessageSquare className="w-10 h-10 text-[#888888]" />
                  </div>
                  <h4 className="text-base font-medium text-[#EAEAEA] mb-2">
                    Ask anything about your notes
                  </h4>
                  <p className="text-sm text-[#888888] max-w-xs mb-6">
                    I&apos;ll search through your saved content and provide answers with sources.
                  </p>

                  {/* Suggested Questions */}
                  <div className="w-full space-y-2">
                    <p className="text-xs text-[#888888] font-mono uppercase tracking-widest mb-3">
                      Suggested questions
                    </p>
                    {SUGGESTED_QUESTIONS.map((question) => (
                      <button
                        key={question}
                        onClick={() => handleSuggestionClick(question)}
                        className="w-full px-4 py-3 text-sm text-left bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 transition-all text-[#EAEAEA]"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] ${
                          message.role === 'user'
                            ? 'px-4 py-3 bg-white/10 rounded-2xl rounded-tr-md'
                            : 'space-y-3'
                        }`}
                      >
                        {message.role === 'user' ? (
                          <p className="text-sm text-[#EAEAEA]">{message.content}</p>
                        ) : (
                          <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-md">
                            <div className="prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown
                                components={{
                                  p: ({ children }) => (
                                    <p className="mb-2 last:mb-0 text-[#EAEAEA]">{children}</p>
                                  ),
                                  ul: ({ children }) => (
                                    <ul className="list-disc pl-4 mb-2 text-[#EAEAEA]">{children}</ul>
                                  ),
                                  ol: ({ children }) => (
                                    <ol className="list-decimal pl-4 mb-2 text-[#EAEAEA]">{children}</ol>
                                  ),
                                  li: ({ children }) => (
                                    <li className="mb-1 text-[#EAEAEA]">{children}</li>
                                  ),
                                  code: ({ children }) => (
                                    <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-[#EAEAEA]">
                                      {children}
                                    </code>
                                  ),
                                  pre: ({ children }) => (
                                    <pre className="bg-white/10 p-3 rounded-lg overflow-x-auto text-xs my-2">
                                      {children}
                                    </pre>
                                  ),
                                  strong: ({ children }) => (
                                    <strong className="font-semibold text-[#EAEAEA]">{children}</strong>
                                  ),
                                  a: ({ href, children }) => (
                                    <a
                                      href={href}
                                      className="text-[#EAEAEA] underline underline-offset-2 hover:opacity-80"
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {children}
                                    </a>
                                  ),
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {/* Sources */}
                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-[#888888]">
                              <BookOpen className="w-3 h-3" />
                              <span>Sources:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {message.sources.map((source, sourceIndex) => (
                                <Link
                                  key={sourceIndex}
                                  href={`/notes/${source.noteId}`}
                                  onClick={onClose}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-white/20 transition-all text-[#888888] hover:text-[#EAEAEA]"
                                >
                                  <span className="truncate max-w-[150px]">
                                    {source.title || 'Untitled'}
                                  </span>
                                  <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Loading State */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl rounded-tl-md">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-[#888888]" />
                          <span className="text-sm text-[#888888]">Searching your notes...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-5 border-t border-white/10 bg-[#050505]/50">
              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your notes..."
                    rows={1}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl resize-none focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10 transition-all text-sm text-[#EAEAEA] placeholder:text-[#888888]"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                  />
                </div>
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-white text-black rounded-xl hover:bg-[#EAEAEA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-[10px] text-[#888888] mt-2 text-center">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
