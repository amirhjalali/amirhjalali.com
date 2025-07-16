import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-5xl md:text-7xl font-space font-bold mb-8 text-center">
        <span className="text-gradient glow">MR AI</span>
      </h1>
      
      <h2 className="text-2xl md:text-3xl font-inter text-gray-300 mb-8 text-center">
        AI-Powered Portfolio & Thoughts
      </h2>
      
      <p className="text-lg text-gray-400 max-w-2xl text-center mb-12">
        Welcome to my digital space where artificial intelligence meets creativity. 
        Explore my projects, read AI-generated insights, and discover the future of technology.
      </p>
      
      <div className="flex gap-4 flex-wrap justify-center">
        <Link 
          href="/projects"
          className="px-6 py-3 bg-ai-green text-black font-semibold rounded-lg hover:bg-ai-green/80 transition-all inline-block"
        >
          Explore Projects
        </Link>
        <Link 
          href="/articles"
          className="px-6 py-3 glass border border-white/20 rounded-lg hover:border-ai-green/50 transition-all inline-block"
        >
          Read Articles
        </Link>
      </div>
    </main>
  )
}