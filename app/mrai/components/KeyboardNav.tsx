'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Command, Keyboard } from 'lucide-react'

interface KeyboardNavContextType {
  showHelp: boolean
  setShowHelp: (show: boolean) => void
}

const KeyboardNavContext = createContext<KeyboardNavContextType>({
  showHelp: false,
  setShowHelp: () => {},
})

export function useKeyboardNav() {
  return useContext(KeyboardNavContext)
}

interface KeyboardNavProviderProps {
  children: ReactNode
}

const SHORTCUTS = [
  { keys: ['?'], description: 'Show this help' },
  { keys: ['/'], description: 'Go to search' },
  { keys: ['r'], description: 'Random discovery' },
  { keys: ['g', 'h'], description: 'Go to MrAI home' },
  { keys: ['g', 'r'], description: 'Go to reflections' },
  { keys: ['g', 'e'], description: 'Go to experiments' },
  { keys: ['g', 'g'], description: 'Go to guestbook' },
  { keys: ['g', 's'], description: 'Go to search' },
  { keys: ['g', 'l'], description: 'Go to glossary' },
  { keys: ['Esc'], description: 'Close modal/overlay' },
]

const NAVIGATION_ROUTES: Record<string, string> = {
  'h': '/mrai',
  'r': '/mrai/reflections',
  'e': '/mrai/experiments',
  'g': '/mrai/guestbook',
  's': '/mrai/search',
  'l': '/mrai/glossary',
}

export function KeyboardNavProvider({ children }: KeyboardNavProviderProps) {
  const [showHelp, setShowHelp] = useState(false)
  const [pendingKey, setPendingKey] = useState<string | null>(null)
  const router = useRouter()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Don't capture shortcuts when typing in inputs
    const target = e.target as HTMLElement
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return
    }

    // Escape always closes help
    if (e.key === 'Escape') {
      setShowHelp(false)
      setPendingKey(null)
      return
    }

    // Show help with ?
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      e.preventDefault()
      setShowHelp(prev => !prev)
      return
    }

    // Go to search with /
    if (e.key === '/' && !pendingKey) {
      e.preventDefault()
      router.push('/mrai/search')
      return
    }

    // Two-key navigation: g + [key]
    if (pendingKey === 'g') {
      const route = NAVIGATION_ROUTES[e.key.toLowerCase()]
      if (route) {
        e.preventDefault()
        router.push(route)
      }
      setPendingKey(null)
      return
    }

    // Start two-key sequence
    if (e.key.toLowerCase() === 'g') {
      setPendingKey('g')
      // Clear pending key after timeout
      setTimeout(() => setPendingKey(null), 1500)
      return
    }
  }, [pendingKey, router])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <KeyboardNavContext.Provider value={{ showHelp, setShowHelp }}>
      {children}

      {/* Pending key indicator */}
      <AnimatePresence>
        {pendingKey && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 font-mono text-sm"
          >
            <span className="text-[#888888]">g</span>
            <span className="text-[#666666]">+ ...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Modal */}
      <AnimatePresence>
        {showHelp && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
              onClick={() => setShowHelp(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-md"
            >
              <div className="glass bg-[#0a0a0a]/95 border border-white/10 rounded-2xl overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Keyboard className="w-5 h-5 text-[#888888]" />
                    <h2 className="text-lg font-serif font-light">Keyboard Shortcuts</h2>
                  </div>
                  <button
                    onClick={() => setShowHelp(false)}
                    className="p-2 text-[#888888] hover:text-[#EAEAEA] hover:bg-white/5 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Shortcuts list */}
                <div className="p-4 space-y-2">
                  {SHORTCUTS.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm text-[#888888]">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            {keyIndex > 0 && (
                              <span className="text-[#666666] text-xs">then</span>
                            )}
                            <kbd className="min-w-[1.5rem] h-6 px-2 flex items-center justify-center rounded bg-white/10 border border-white/20 text-xs font-mono text-[#EAEAEA]">
                              {key}
                            </kbd>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/10 text-center">
                  <p className="text-xs text-[#666666]">
                    Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono">Esc</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/10 border border-white/20 font-mono">?</kbd> to close
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </KeyboardNavContext.Provider>
  )
}

/**
 * Small hint component to show in footer/nav
 */
export function KeyboardHint() {
  const { setShowHelp } = useKeyboardNav()

  return (
    <button
      onClick={() => setShowHelp(true)}
      className="text-xs font-mono text-[#666666] hover:text-[#888888] transition-colors flex items-center gap-1"
    >
      Press <kbd className="px-1 py-0.5 rounded bg-white/5 border border-white/10">?</kbd> for shortcuts
    </button>
  )
}
