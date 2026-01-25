'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Share2, Link2, Twitter, Check, X } from 'lucide-react'

interface ShareButtonProps {
  url?: string
  title: string
  text?: string
  className?: string
  variant?: 'minimal' | 'expanded'
}

export default function ShareButton({
  url,
  title,
  text,
  className = '',
  variant = 'minimal'
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Use current URL if not provided
  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '')

  // Generate Twitter share text
  const twitterText = text || `"${title}" — from MrAI`
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}&url=${encodeURIComponent(shareUrl)}`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: text || `From MrAI: ${title}`,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or error
        if ((err as Error).name !== 'AbortError') {
          console.error('Share failed:', err)
        }
      }
    } else {
      // Fallback to opening menu
      setIsOpen(true)
    }
  }

  if (variant === 'minimal') {
    return (
      <div className={`relative ${className}`}>
        <button
          onClick={handleNativeShare}
          className="p-2 text-[#888888] hover:text-[#EAEAEA] hover:bg-white/5 rounded-lg transition-all"
          aria-label="Share this page"
          title="Share"
        >
          <Share2 className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />

              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 z-50 w-48 py-2 bg-[#0a0a0a] border border-white/10 rounded-lg shadow-xl"
              >
                <button
                  onClick={copyToClipboard}
                  className="w-full px-4 py-2 flex items-center gap-3 text-sm text-[#888888] hover:text-[#EAEAEA] hover:bg-white/5 transition-all"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-[#EAEAEA]" />
                  ) : (
                    <Link2 className="w-4 h-4" />
                  )}
                  {copied ? 'Copied!' : 'Copy link'}
                </button>

                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2 flex items-center gap-3 text-sm text-[#888888] hover:text-[#EAEAEA] hover:bg-white/5 transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  <Twitter className="w-4 h-4" />
                  Share on X
                </a>

                <div className="mt-2 pt-2 border-t border-white/10 px-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full py-1 text-xs text-[#666666] hover:text-[#888888] transition-colors flex items-center justify-center gap-1"
                  >
                    <X className="w-3 h-3" />
                    Close
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // Expanded variant - shows buttons inline
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-xs font-mono text-[#666666] uppercase tracking-widest">Share</span>

      <button
        onClick={copyToClipboard}
        className="p-2 text-[#888888] hover:text-[#EAEAEA] hover:bg-white/5 rounded-lg transition-all"
        title="Copy link"
      >
        {copied ? (
          <Check className="w-4 h-4 text-[#EAEAEA]" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
      </button>

      <a
        href={twitterUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 text-[#888888] hover:text-[#EAEAEA] hover:bg-white/5 rounded-lg transition-all"
        title="Share on X"
      >
        <Twitter className="w-4 h-4" />
      </a>

      {typeof navigator !== 'undefined' && navigator.share && (
        <button
          onClick={handleNativeShare}
          className="p-2 text-[#888888] hover:text-[#EAEAEA] hover:bg-white/5 rounded-lg transition-all"
          title="More sharing options"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
