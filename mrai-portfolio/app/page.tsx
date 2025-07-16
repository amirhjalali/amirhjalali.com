import AnimatedLogo from '@/components/AnimatedLogo'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="mb-16">
        <AnimatedLogo />
      </div>
      
      <h2 className="text-2xl md:text-3xl font-inter text-gray-300 mb-8 text-center">
        AI-Powered Portfolio & Thoughts
      </h2>
      
      <p className="text-lg text-gray-400 max-w-2xl text-center mb-12">
        Welcome to my digital space where artificial intelligence meets creativity. 
        Explore my projects, read AI-generated insights, and discover the future of technology.
      </p>
      
      <div className="flex gap-4 flex-wrap justify-center">
        <button className="px-6 py-3 bg-ai-green text-black font-semibold rounded-lg hover:bg-ai-green/80 transition-all">
          Explore Projects
        </button>
        <button className="px-6 py-3 glass border border-white/20 rounded-lg hover:border-ai-green/50 transition-all">
          Read Articles
        </button>
      </div>
    </main>
  )
}