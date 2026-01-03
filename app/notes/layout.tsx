import Link from 'next/link'
import { StickyNote } from 'lucide-react'

export default function NotesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {/* Notes-specific Header - Replaces main nav for notes section */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo/Back Link */}
          <Link href="/" className="group">
            <h2 className="text-xl font-serif font-light tracking-tight text-[#EAEAEA] hover:text-white transition-colors">
              Amir H. Jalali
            </h2>
          </Link>

          {/* Minimal Page Indicator */}
          <div className="flex items-center gap-3">
            <StickyNote className="w-4 h-4 text-[#444444]" />
            <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#444444]">
              Notes
            </span>
          </div>
        </div>
      </header>

      {/* Main Content with proper top spacing */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-16">
        {children}
      </div>
    </>
  )
}
