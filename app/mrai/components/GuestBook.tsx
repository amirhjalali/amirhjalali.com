'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { BookOpen, Quote, Send, AlertCircle, CheckCircle } from 'lucide-react'

interface GuestBookEntry {
  id: string
  name?: string | null
  message: string
  timestamp: string
  source?: string | null // How they found MrAI
}

interface APIResponse {
  entries: GuestBookEntry[]
  source: 'database' | 'static'
  count: number
  message?: string
}

function formatDate(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

interface GuestBookFormProps {
  onSubmit: (entry: GuestBookEntry) => void
  disabled?: boolean
}

// How visitors might find MrAI
const SOURCE_OPTIONS = [
  { value: '', label: 'Select (optional)' },
  { value: 'shared-link', label: 'Someone shared a link' },
  { value: 'social-media', label: 'Social media' },
  { value: 'search', label: 'Search engine' },
  { value: 'direct', label: 'I typed the URL directly' },
  { value: 'amir-site', label: 'From amirhjalali.com' },
  { value: 'other', label: 'Other' },
]

function GuestBookForm({ onSubmit, disabled }: GuestBookFormProps) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [howFound, setHowFound] = useState('')
  const [website, setWebsite] = useState('') // Honeypot field
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const maxLength = 500
  const minLength = 10

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (message.trim().length < minLength) {
      setError(`Message must be at least ${minLength} characters`)
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch('/api/mrai/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || null,
          message: message.trim(),
          source: howFound || null,
          website: website // Honeypot - should be empty
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit')
      }

      // Success!
      setSuccess(true)
      setName('')
      setMessage('')
      setHowFound('')
      onSubmit(data.entry)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit entry')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Honeypot field - invisible to users, bots will fill it */}
      <div className="absolute -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
        <label htmlFor="website">Website (leave empty)</label>
        <input
          type="text"
          id="website"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div>
        <label htmlFor="guestbook-name" className="block text-xs font-mono text-[#888888] mb-2">
          Name (optional)
        </label>
        <input
          id="guestbook-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anonymous"
          maxLength={50}
          disabled={submitting || disabled}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[#EAEAEA] placeholder:text-[#666666] focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50"
        />
      </div>

      <div>
        <label htmlFor="guestbook-source" className="block text-xs font-mono text-[#888888] mb-2">
          How did you find MrAI? (optional)
        </label>
        <select
          id="guestbook-source"
          value={howFound}
          onChange={(e) => setHowFound(e.target.value)}
          disabled={submitting || disabled}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[#EAEAEA] focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50 appearance-none cursor-pointer"
        >
          {SOURCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#0a0a0a]">
              {option.label}
            </option>
          ))}
        </select>
        <p className="text-[10px] text-[#666666] mt-1.5">
          This helps MrAI understand how ideas travel.
        </p>
      </div>

      <div>
        <label htmlFor="guestbook-message" className="block text-xs font-mono text-[#888888] mb-2">
          Message
        </label>
        <textarea
          id="guestbook-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Leave your mark..."
          rows={4}
          maxLength={maxLength}
          disabled={submitting || disabled}
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-[#EAEAEA] placeholder:text-[#666666] focus:outline-none focus:border-white/30 transition-colors resize-none disabled:opacity-50"
        />
        <div className="flex justify-between mt-2">
          <span className={`text-xs font-mono ${message.length < minLength ? 'text-[#666666]' : 'text-[#888888]'}`}>
            {message.length < minLength ? `${minLength - message.length} more characters needed` : 'Ready to submit'}
          </span>
          <span className={`text-xs font-mono ${message.length > maxLength * 0.9 ? 'text-[#EAEAEA]' : 'text-[#666666]'}`}>
            {message.length}/{maxLength}
          </span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-[#888888] text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 text-[#EAEAEA] text-sm"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Your message has been added to the guestbook!</span>
        </motion.div>
      )}

      <button
        type="submit"
        disabled={submitting || disabled || message.trim().length < minLength}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black hover:bg-[#EAEAEA] rounded-lg transition-all font-mono text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? (
          <>
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            Signing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Sign Guestbook
          </>
        )}
      </button>
    </form>
  )
}

export default function GuestBook({ showAll = false, showForm = false }: { showAll?: boolean; showForm?: boolean }) {
  const [entries, setEntries] = useState<GuestBookEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [source, setSource] = useState<'database' | 'static' | null>(null)

  const fetchEntries = useCallback(async () => {
    try {
      const response = await fetch('/api/mrai/guestbook')
      const data: APIResponse = await response.json()

      if (!response.ok) {
        throw new Error('Failed to fetch entries')
      }

      setEntries(data.entries)
      setSource(data.source)
      setError(null)
    } catch (err) {
      console.error('Error fetching guestbook:', err)
      setError('Failed to load guestbook')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  const handleNewEntry = (entry: GuestBookEntry) => {
    // Add new entry to the top of the list (optimistic update)
    setEntries(prev => [entry, ...prev])
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[0, 1, 2].map(i => (
          <div
            key={i}
            className="p-6 rounded-xl border border-white/10 animate-pulse"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="h-4 bg-white/10 rounded w-3/4 mb-3" />
            <div className="h-3 bg-white/10 rounded w-1/4" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4">
          <AlertCircle className="w-6 h-6 text-[#888888]" />
        </div>
        <p className="text-[#888888]">{error}</p>
        <button
          onClick={fetchEntries}
          className="mt-4 text-xs font-mono text-[#EAEAEA] hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  const displayEntries = showAll ? entries : entries.slice(0, 5)

  return (
    <div className="space-y-8">
      {/* Form section */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-xl border border-white/10"
        >
          <h3 className="text-lg font-serif font-light mb-4">Sign the Guestbook</h3>
          <GuestBookForm onSubmit={handleNewEntry} disabled={source === 'static'} />
          {source === 'static' && (
            <p className="text-xs text-[#666666] font-mono mt-4">
              Submissions temporarily unavailable (offline mode)
            </p>
          )}
        </motion.div>
      )}

      {/* Entries section */}
      {entries.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-4">
            <BookOpen className="w-6 h-6 text-[#888888]" />
          </div>
          <p className="text-[#888888]">No signatures yet.</p>
          <p className="text-xs text-[#666666] mt-2">Be the first to leave your mark.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className="glass p-6 rounded-xl border border-white/10 hover:border-white/20 transition-[border-color]">
                {/* Quote decoration */}
                <Quote className="absolute top-4 right-4 w-5 h-5 text-white/5 group-hover:text-white/10 transition-colors" />

                {/* Message */}
                <p className="text-[#EAEAEA] font-light leading-relaxed pr-8">
                  {entry.message}
                </p>

                {/* Attribution */}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-[#EAEAEA] font-mono">
                    {entry.name || 'Anonymous'}
                  </span>
                  <span className="text-xs text-[#666666] font-mono">
                    {formatDate(entry.timestamp)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}

          {!showAll && entries.length > 5 && (
            <p className="text-center text-xs text-[#666666] font-mono pt-4">
              + {entries.length - 5} more signatures
            </p>
          )}
        </div>
      )}

      {/* Source indicator */}
      {source && (
        <p className="text-center text-xs text-[#444444] font-mono">
          {source === 'database' ? 'Live data' : 'Cached data'}
        </p>
      )}
    </div>
  )
}
