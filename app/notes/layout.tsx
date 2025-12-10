import { Cormorant_Garamond, JetBrains_Mono } from 'next/font/google'
import Link from 'next/link'
import { StickyNote } from 'lucide-react'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen font-sans antialiased bg-[#050505] text-[#EAEAEA] selection:bg-white selection:text-black">
        {/* Header */}
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/notes" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <StickyNote className="w-6 h-6" />
                <h1 className="text-lg font-mono font-bold">Notes</h1>
              </Link>
              <nav className="flex items-center gap-6">
                <Link
                  href="/notes"
                  className="text-xs font-mono uppercase tracking-widest hover:text-white transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/work"
                  className="text-xs font-mono uppercase tracking-widest text-[#888888] hover:text-white transition-colors"
                >
                  Work
                </Link>
                <Link
                  href="/thoughts"
                  className="text-xs font-mono uppercase tracking-widest text-[#888888] hover:text-white transition-colors"
                >
                  Thoughts
                </Link>
                <Link
                  href="/about"
                  className="text-xs font-mono uppercase tracking-widest text-[#888888] hover:text-white transition-colors"
                >
                  About
                </Link>
                <Link
                  href="/"
                  className="text-xs font-mono uppercase tracking-widest text-[#888888] hover:text-white transition-colors"
                >
                  Home
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
