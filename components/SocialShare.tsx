'use client'

import { motion } from 'framer-motion'
import { Twitter, Linkedin, Facebook, Link2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface SocialShareProps {
  url: string
  title: string
  description?: string
  className?: string
}

export default function SocialShare({
  url,
  title,
  description = '',
  className = ''
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${url}`
    : `https://amirhjalali.com${url}`

  const shareLinks = [
    {
      name: 'Twitter',
      icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-500/20 hover:text-blue-400'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-600/20 hover:text-blue-500'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-700/20 hover:text-blue-600'
    }
  ]

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm text-muted-foreground mr-2">Share:</span>

      {shareLinks.map((link, index) => {
        const Icon = link.icon
        return (
          <motion.div
            key={link.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'w-9 h-9 rounded-full transition-all',
                link.color
              )}
              onClick={() => window.open(link.href, '_blank', 'width=600,height=400')}
              aria-label={`Share on ${link.name}`}
            >
              <Icon className="w-4 h-4" />
            </Button>
          </motion.div>
        )
      })}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'w-9 h-9 rounded-full transition-all',
            copied
              ? 'bg-green-500/20 text-green-400'
              : 'hover:bg-gray-500/20 hover:text-gray-400'
          )}
          onClick={copyToClipboard}
          aria-label="Copy link"
        >
          {copied ? (
            <Check className="w-4 h-4" />
          ) : (
            <Link2 className="w-4 h-4" />
          )}
        </Button>
      </motion.div>
    </div>
  )
}