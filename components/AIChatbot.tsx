'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot, 
  User, 
  Sparkles,
  Loader2,
  MinusSquare,
  Plus
} from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface ChatMessage {
  id: string
  content: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

interface QuickQuestion {
  id: string
  question: string
  category: string
}

const quickQuestions: QuickQuestion[] = [
  { id: '1', question: "What AI services do you offer?", category: "services" },
  { id: '2', question: "How much does an AI consultation cost?", category: "pricing" },
  { id: '3', question: "What's your experience with LLMs?", category: "experience" },
  { id: '4', question: "Can you help with data engineering?", category: "services" },
  { id: '5', question: "Do you work with small businesses?", category: "business" },
  { id: '6', question: "What's your background?", category: "about" }
]

const getAIResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase()
  
  // Services questions
  if (message.includes('service') || message.includes('offer') || message.includes('do')) {
    return `I offer comprehensive AI consulting services including:

🤖 **AI Strategy & Implementation**
- Generative AI integration
- LLM deployment and optimization
- Custom AI solution development

📊 **Data Engineering & Analytics**
- Data pipeline design
- Business intelligence solutions
- Data warehousing architecture

🚀 **Technology Leadership**
- AI team building and training
- Technical roadmap development
- Digital transformation guidance

Currently serving as CTO at AVENU AI, I help organizations of all sizes leverage AI for competitive advantage. Would you like to discuss your specific needs?`
  }
  
  // Pricing questions
  if (message.includes('cost') || message.includes('price') || message.includes('fee') || message.includes('much')) {
    return `Great question! My pricing varies based on project scope and requirements:

💬 **Free Consultation** (30 min)
- Initial strategy discussion
- Problem assessment
- High-level recommendations

💼 **Consulting Rates**
- Hourly: $200-400/hour
- Project-based: Custom quotes
- Retainer options available

🎯 **What's Included:**
- Expert technical guidance
- Implementation support
- Ongoing optimization
- Training and documentation

The first consultation is always free to ensure we're a good fit. Ready to schedule a call to discuss your specific needs?`
  }
  
  // Experience questions
  if (message.includes('experience') || message.includes('background') || message.includes('llm') || message.includes('ai')) {
    return `I bring 14+ years of experience in data and AI:

🎓 **Background:**
- Currently CTO at AVENU AI
- 14 years in Data Warehousing & BI
- Expertise in Generative AI and LLMs

🔧 **Technical Expertise:**
- Large Language Models (GPT, Claude, LLaMA)
- Prompt engineering and fine-tuning
- RAG (Retrieval Augmented Generation)
- Vector databases and embeddings
- Python, SQL, cloud platforms

🏆 **Recent Projects:**
- AI recruitment platform (AVENU AI)
- LLM-powered content moderation (ARGUMEND)
- Advertising optimization with GenAI (PLAICED)

I focus on practical AI implementations that deliver measurable business value. What specific AI challenges are you facing?`
  }
  
  // Data engineering questions
  if (message.includes('data') || message.includes('engineering') || message.includes('pipeline') || message.includes('warehouse')) {
    return `Absolutely! Data engineering is one of my core specialties:

🏗️ **Data Infrastructure:**
- Modern data stack design
- ETL/ELT pipeline development
- Real-time streaming architectures
- Cloud data platform setup (AWS, GCP, Azure)

📊 **Analytics & BI:**
- Data warehouse optimization
- Business intelligence dashboards
- Self-service analytics platforms
- Data governance frameworks

🤖 **AI-Ready Data:**
- ML feature engineering
- Vector database setup
- Data quality monitoring
- Privacy-preserving techniques

With 14 years in data warehousing and BI, I can help you build robust, scalable data infrastructure that supports both traditional analytics and modern AI applications.

What's your current data challenge?`
  }
  
  // Business size questions
  if (message.includes('small business') || message.includes('startup') || message.includes('enterprise') || message.includes('size')) {
    return `Yes, I work with organizations of all sizes! 🚀

**Startups & Small Businesses:**
- Cost-effective AI solutions
- MVP development guidance
- Lean implementation strategies
- Growth-focused roadmaps

**Mid-Market Companies:**
- Scalable AI architectures
- Team training and development
- Process optimization
- Competitive differentiation

**Enterprise Organizations:**
- Large-scale AI transformation
- Legacy system integration
- Governance and compliance
- Cross-functional collaboration

Each engagement is tailored to your specific needs, budget, and growth stage. I believe AI should be accessible to businesses of all sizes.

What type of organization are you working with?`
  }
  
  // About/background questions
  if (message.includes('about') || message.includes('who') || message.includes('background')) {
    return `Hi! I'm Amir H. Jalali, an AI consultant and technology leader. 👋

🎯 **Current Role:**
CTO at AVENU AI - building AI-powered recruitment solutions

📈 **Experience:**
14+ years in data engineering, business intelligence, and AI strategy

🚀 **Mission:**
Helping organizations transform through practical AI implementation

🔬 **Philosophy:**
I believe in "Vibe Coding" - using AI to accelerate development while maintaining human creativity and strategic thinking.

**Recent Projects:**
- AI recruitment platform with 230% efficiency gains
- LLM-powered discourse improvement platform
- Generative AI advertising optimization

I'm passionate about making AI accessible and practical for real business challenges. Whether you're just getting started or scaling existing AI initiatives, I'd love to help!

What brings you here today?`
  }
  
  // Default response
  return `Thanks for your question! I'd be happy to help you with AI strategy, data engineering, or technology challenges.

Here are some quick ways I can assist:

🤖 **AI Implementation** - From strategy to deployment
📊 **Data Engineering** - Building robust data infrastructure  
🚀 **Technology Leadership** - Guiding your tech transformation
💡 **Consultation** - Free 30-minute strategy session

Would you like to schedule a consultation to discuss your specific needs? Or feel free to ask me anything about AI, data engineering, or my experience!`
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm Amir's AI assistant. I can answer questions about AI consulting, data engineering services, or help you get in touch. What would you like to know?",
      sender: 'assistant',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: content.trim(),
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    // Track chatbot interaction
    trackEvent({
      category: 'Engagement',
      action: 'Chatbot Interaction',
      label: 'User Message',
      value: content.length,
    })

    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const aiResponse = getAIResponse(content)
    
    const assistantMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: aiResponse,
      sender: 'assistant',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, assistantMessage])
    setIsTyping(false)
  }

  const handleQuickQuestion = (question: string) => {
    sendMessage(question)
  }

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-r from-ai-green to-ai-blue rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
          >
            <MessageCircle className="w-6 h-6 text-black" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '600px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-96 glass border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-ai-green/20 to-ai-blue/20 border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-ai-green to-ai-blue rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">AI Assistant</h3>
                  <p className="text-xs text-muted-foreground">Ask me anything!</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8 p-0"
                >
                  {isMinimized ? <Plus className="w-4 h-4" /> : <MinusSquare className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="h-96 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                          message.sender === 'user' 
                            ? 'bg-ai-blue' 
                            : 'bg-gradient-to-r from-ai-green to-ai-blue'
                        }`}>
                          {message.sender === 'user' ? (
                            <User className="w-3 h-3 text-black" />
                          ) : (
                            <Bot className="w-3 h-3 text-black" />
                          )}
                        </div>
                        <div className={`rounded-2xl p-3 ${
                          message.sender === 'user'
                            ? 'bg-ai-blue/20 text-white'
                            : 'bg-background/80 text-foreground'
                        }`}>
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          <div className="text-xs opacity-60 mt-1">
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="flex gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-ai-green to-ai-blue rounded-full flex items-center justify-center">
                          <Bot className="w-3 h-3 text-black" />
                        </div>
                        <div className="bg-background/80 rounded-2xl p-3 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Questions */}
                {messages.length === 1 && (
                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-ai-green" />
                      <span className="text-sm font-medium">Quick questions:</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                      {quickQuestions.slice(0, 3).map((q) => (
                        <button
                          key={q.id}
                          onClick={() => handleQuickQuestion(q.question)}
                          className="text-left text-sm p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          {q.question}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage(inputMessage)}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-background/50 border-white/20 focus:border-ai-green/50"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={() => sendMessage(inputMessage)}
                      disabled={!inputMessage.trim() || isTyping}
                      size="sm"
                      className="bg-gradient-to-r from-ai-green to-ai-blue text-black hover:from-ai-blue hover:to-ai-green"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}