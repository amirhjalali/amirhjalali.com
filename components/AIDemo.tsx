'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Sparkles, 
  Brain, 
  Zap, 
  Code, 
  TrendingUp, 
  MessageSquare,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { trackAIToolsInteraction } from '@/lib/analytics'

interface DemoItem {
  id: string
  title: string
  description: string
  icon: React.ElementType
  category: string
  placeholder: string
  example: string
}

const aiDemos: DemoItem[] = [
  {
    id: 'prompt-engineering',
    title: 'Prompt Engineering',
    description: 'Transform basic prompts into optimized instructions for better AI results',
    icon: Brain,
    category: 'LLMs',
    placeholder: 'Enter a basic prompt to optimize...',
    example: 'Write a marketing email'
  },
  {
    id: 'code-review',
    title: 'AI Code Review',
    description: 'Get intelligent code analysis and improvement suggestions',
    icon: Code,
    category: 'Development',
    placeholder: 'Paste your code here...',
    example: 'function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0); }'
  },
  {
    id: 'data-insights',
    title: 'Data Analysis',
    description: 'Generate insights and recommendations from your data patterns',
    icon: TrendingUp,
    category: 'Analytics',
    placeholder: 'Describe your data or business challenge...',
    example: 'Our e-commerce sales dropped 20% last quarter'
  },
  {
    id: 'content-strategy',
    title: 'Content Strategy',
    description: 'Create comprehensive content plans with AI assistance',
    icon: MessageSquare,
    category: 'Marketing',
    placeholder: 'What type of content do you need help with?',
    example: 'Blog posts about AI for small businesses'
  }
]

export default function AIDemo() {
  const [activeDemo, setActiveDemo] = useState<string>(aiDemos[0].id)
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const activeItem = aiDemos.find(demo => demo.id === activeDemo) || aiDemos[0]

  const handleDemoChange = (demoId: string) => {
    setActiveDemo(demoId)
    setInput('')
    setOutput('')
    setIsComplete(false)
    trackAIToolsInteraction(aiDemos.find(d => d.id === demoId)?.title || demoId)
  }

  const runDemo = async () => {
    if (!input.trim()) return

    setIsProcessing(true)
    setOutput('')
    setIsComplete(false)

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Generate demo output based on the active demo
    let demoOutput = ''
    switch (activeDemo) {
      case 'prompt-engineering':
        demoOutput = `**Optimized Prompt:**

"Act as an expert marketing copywriter. Create a compelling marketing email for [your product/service] that:

1. Uses an attention-grabbing subject line
2. Addresses the reader's specific pain points
3. Highlights 3 key benefits with social proof
4. Includes a clear, action-oriented CTA
5. Maintains a conversational, authentic tone

Target audience: [describe your audience]
Email length: 150-200 words
Goal: [specific conversion goal]

Please provide the subject line and email body separately."`
        break
        
      case 'code-review':
        demoOutput = `**Code Analysis:**

✅ **Strengths:**
- Clean, functional approach using reduce()
- Good variable naming
- Handles empty arrays gracefully

⚠️ **Improvements:**
- Add input validation for items array
- Handle cases where items might not have price property
- Consider TypeScript for better type safety

**Optimized Version:**
\`\`\`javascript
function calculateTotal(items = []) {
  if (!Array.isArray(items)) {
    throw new Error('Items must be an array');
  }
  
  return items.reduce((sum, item) => {
    const price = typeof item.price === 'number' ? item.price : 0;
    return sum + price;
  }, 0);
}
\`\`\``
        break

      case 'data-insights':
        demoOutput = `**Analysis & Recommendations:**

📊 **Potential Causes:**
- Seasonal trends (Q4 holiday effect wearing off)
- Increased competition
- Changes in customer behavior
- Marketing campaign performance

🎯 **Immediate Actions:**
1. **Customer Retention**: Implement win-back campaigns for lapsed customers
2. **Pricing Strategy**: Analyze competitor pricing and adjust if needed
3. **Product Mix**: Focus on high-margin, popular items
4. **Marketing Channels**: Reallocate budget from underperforming channels

📈 **Recovery Strategy:**
- A/B test new messaging and offers
- Enhance personalization in product recommendations
- Improve checkout process to reduce cart abandonment`
        break

      case 'content-strategy':
        demoOutput = `**Content Strategy Plan:**

🎯 **Target Keywords:**
- "AI for small business"
- "artificial intelligence benefits"
- "AI tools for entrepreneurs"

📝 **Content Series (8 weeks):**
1. "AI Basics: What Small Businesses Need to Know"
2. "5 AI Tools That Can Transform Your Business Today"
3. "Real Case Studies: Small Businesses Using AI Successfully"
4. "AI vs. Human: Finding the Right Balance"
5. "Getting Started: Your First AI Implementation"
6. "Measuring AI ROI: What to Track"
7. "Common AI Mistakes and How to Avoid Them"
8. "Future-Proofing Your Business with AI"

📊 **Distribution:**
- Blog posts (1,500-2,000 words each)
- LinkedIn articles (shorter versions)
- Email newsletter series
- Social media snippets`
        break
    }

    setOutput(demoOutput)
    setIsProcessing(false)
    setIsComplete(true)
  }

  const loadExample = () => {
    setInput(activeItem.example)
    setOutput('')
    setIsComplete(false)
  }

  return (
    <div className="glass p-8 rounded-2xl border border-white/10 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-ai-green/5 via-transparent to-ai-blue/5 opacity-50" />
      <div className="absolute top-4 right-4 w-20 h-20 bg-ai-green/10 rounded-full blur-xl" />
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-6 h-6 text-ai-green" />
          <h2 className="text-3xl font-bold">AI Capabilities Demo</h2>
        </div>

        <p className="text-muted-foreground mb-8 text-lg">
          Experience the power of AI-driven solutions. Select a demo to see how AI can transform your business processes.
        </p>

        {/* Demo Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {aiDemos.map((demo) => {
            const Icon = demo.icon
            const isActive = activeDemo === demo.id
            
            return (
              <motion.button
                key={demo.id}
                onClick={() => handleDemoChange(demo.id)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className={`p-4 rounded-xl border transition-all text-left ${
                  isActive 
                    ? 'bg-gradient-to-r from-ai-green/20 to-ai-blue/20 border-ai-green/30' 
                    : 'glass border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-ai-green' : 'text-muted-foreground'}`} />
                  <Badge variant="outline" className="text-xs">
                    {demo.category}
                  </Badge>
                </div>
                <h3 className={`font-medium mb-1 ${isActive ? 'text-white' : 'text-muted-foreground'}`}>
                  {demo.title}
                </h3>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {demo.description}
                </p>
              </motion.button>
            )
          })}
        </div>

        {/* Demo Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Input</h3>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadExample}
                className="text-ai-green border-ai-green/30 hover:bg-ai-green/10"
              >
                Load Example
              </Button>
            </div>
            
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={activeItem.placeholder}
              className="min-h-[200px] bg-background/50 border-white/20 focus:border-ai-green/50 resize-none"
            />
            
            <Button
              onClick={runDemo}
              disabled={!input.trim() || isProcessing}
              className="w-full mt-4 bg-gradient-to-r from-ai-green to-ai-blue text-black hover:from-ai-blue hover:to-ai-green font-medium"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Run AI Demo
                </>
              )}
            </Button>
          </div>

          {/* Output Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <h3 className="text-xl font-semibold">AI Output</h3>
              {isComplete && <CheckCircle className="w-5 h-5 text-ai-green" />}
            </div>
            
            <div className="min-h-[200px] bg-background/50 border border-white/20 rounded-lg p-4">
              {output ? (
                <div className="prose prose-sm prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-foreground font-sans">
                    {output}
                  </pre>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>AI output will appear here</p>
                  </div>
                </div>
              )}
            </div>
            
            {isComplete && (
              <div className="mt-4 p-4 glass rounded-lg border border-ai-green/30">
                <p className="text-sm text-ai-green mb-2">
                  ✨ This is just a demo! Real implementations would be:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Customized to your specific needs and data</li>
                  <li>• Integrated with your existing systems</li>
                  <li>• Continuously improved based on feedback</li>
                  <li>• Backed by proper training and support</li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}