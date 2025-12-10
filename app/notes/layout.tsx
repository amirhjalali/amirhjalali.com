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
        {/* Simple Notes Indicator */}
        <div className="border-b border-white/10 bg-transparent pt-24 pb-4">
          <div className="max-w-7xl mx-auto px-6">
            <Link href="/notes" className="flex items-center gap-2 hover:opacity-80 transition-opacity w-fit">
              <StickyNote className="w-5 h-5" />
              <h1 className="text-sm font-mono uppercase tracking-widest text-[#888888]">Notes Dashboard</h1>
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
