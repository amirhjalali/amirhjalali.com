import { Metadata } from 'next'
import CalendlyWidget from '@/components/CalendlyWidget'
import { motion } from 'framer-motion'

export const metadata: Metadata = {
  title: 'Book a Consultation',
  description: 'Schedule a free consultation with Amir H. Jalali to discuss your AI strategy, data engineering needs, or technology challenges.',
  openGraph: {
    title: 'Book a Consultation | Amir H. Jalali',
    description: 'Schedule a free consultation to discuss your AI strategy and technology needs.',
  },
}

export default function BookPage() {
  return (
    <div className="min-h-screen relative">
      {/* Background effects */}
      <div className="absolute inset-0 mesh-gradient opacity-20" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMDMiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20" />
      
      {/* Floating elements */}
      <div className="absolute top-20 left-10 w-2 h-2 bg-ai-green rounded-full animate-pulse" />
      <div className="absolute top-40 right-20 w-1 h-1 bg-ai-blue rounded-full animate-pulse delay-1000" />
      <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-ai-green rounded-full animate-pulse delay-2000" />

      <div className="relative z-10 px-6 py-20 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ai-green/20 to-ai-blue/20 rounded-full text-sm font-medium mb-6">
            📅 Consultation Booking
          </div>
          
          <h1 className="text-5xl md:text-7xl font-space font-black mb-6">
            <span className="text-gradient">Let's Talk AI</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
            Ready to transform your business with AI? Book a free consultation to explore opportunities and create your strategic roadmap.
          </p>
        </div>

        {/* What to Expect Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">What to Expect</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "AI Strategy Assessment",
                description: "Evaluate your current tech stack and identify AI opportunities",
                icon: "🎯"
              },
              {
                title: "Technology Roadmap",
                description: "Create a clear plan for implementing AI solutions",
                icon: "🗺️"
              },
              {
                title: "ROI Analysis",
                description: "Understand the potential return on AI investments",
                icon: "📈"
              },
              {
                title: "Next Steps",
                description: "Get actionable recommendations you can implement immediately",
                icon: "🚀"
              }
            ].map((item, index) => (
              <div key={index} className="glass p-6 rounded-xl border border-white/10 text-center">
                <div className="text-3xl mb-4">{item.icon}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Calendly Widget */}
        <CalendlyWidget 
          title="Schedule Your Free Consultation"
          description="Choose a time that works for you. I'll send you a calendar invite with the video call details."
          url="https://calendly.com/amirhjalali/ai-consultation" // Update with actual Calendly URL
        />

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "Is the consultation really free?",
                answer: "Yes, absolutely! The first 30-minute consultation is completely free with no obligations."
              },
              {
                question: "What if I'm not sure if I need AI?",
                answer: "That's exactly what we'll discuss! I'll help you identify if and where AI can benefit your business."
              },
              {
                question: "Do you work with small businesses?",
                answer: "Yes, I work with organizations of all sizes, from startups to enterprise companies."
              },
              {
                question: "What happens after the consultation?",
                answer: "You'll receive a summary with recommendations. There's no pressure to work together unless it's a mutual fit."
              }
            ].map((faq, index) => (
              <div key={index} className="glass p-6 rounded-xl border border-white/10">
                <h3 className="font-bold mb-3 text-ai-green">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}