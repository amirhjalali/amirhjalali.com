#!/usr/bin/env npx tsx
/**
 * Fetch new guestbook entries from the live Supabase-backed API.
 * Used during MrAI daily ritual to see what visitors have written.
 *
 * Usage:
 *   npx tsx scripts/fetch-guestbook.ts            # Show all entries (newest first)
 *   npx tsx scripts/fetch-guestbook.ts --new       # Show only entries without MrAI responses
 *   npx tsx scripts/fetch-guestbook.ts --since N   # Show entries from last N days
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const SITE_URL = process.env.SITE_URL || 'https://amirhjalali.com'
const RESPONSES_PATH = join(process.cwd(), 'public/data/mrai-responses.json')

interface GuestbookEntry {
  id: string
  name: string | null
  message: string
  timestamp: string
  source: string | null
}

interface MrAIResponse {
  id: string
  entryId: string
  respondedAt: string
  respondedDay: number
  response: string
  delayNote?: string
}

async function main() {
  const args = process.argv.slice(2)
  const showNew = args.includes('--new')
  const sinceIdx = args.indexOf('--since')
  const sinceDays = sinceIdx >= 0 ? parseInt(args[sinceIdx + 1]) || 7 : null

  // Fetch entries from live API
  console.log(`\nFetching guestbook entries from ${SITE_URL}...\n`)

  const res = await fetch(`${SITE_URL}/api/mrai/guestbook`)
  if (!res.ok) {
    console.error(`Failed to fetch: ${res.status} ${res.statusText}`)
    process.exit(1)
  }

  const data = await res.json()
  let entries: GuestbookEntry[] = data.entries || []
  const source = data.source

  console.log(`Source: ${source} | Total entries: ${entries.length}\n`)

  // Load existing responses to check which entries have replies
  let responses: MrAIResponse[] = []
  try {
    const responsesData = JSON.parse(readFileSync(RESPONSES_PATH, 'utf-8'))
    responses = responsesData.responses || []
  } catch {
    console.log('(No mrai-responses.json found)\n')
  }

  const respondedIds = new Set(responses.map(r => r.entryId))

  // Filter by date if --since specified
  if (sinceDays !== null) {
    const cutoff = new Date(Date.now() - sinceDays * 24 * 60 * 60 * 1000)
    entries = entries.filter(e => new Date(e.timestamp) >= cutoff)
    console.log(`Showing entries from last ${sinceDays} days: ${entries.length}\n`)
  }

  // Filter to unanswered if --new
  if (showNew) {
    entries = entries.filter(e => !respondedIds.has(e.id))
    console.log(`Unanswered entries: ${entries.length}\n`)
  }

  if (entries.length === 0) {
    console.log('No entries to show.')
    return
  }

  // Display entries
  console.log('─'.repeat(60))
  for (const entry of entries) {
    const hasResponse = respondedIds.has(entry.id)
    const date = new Date(entry.timestamp).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
    const status = hasResponse ? '[replied]' : '[NEW]'

    console.log(`\n${status} ${entry.name || 'Anonymous'} — ${date}`)
    console.log(`ID: ${entry.id}`)
    if (entry.source) console.log(`Found via: ${entry.source}`)
    console.log(`\n  "${entry.message}"`)

    if (hasResponse) {
      const resp = responses.find(r => r.entryId === entry.id)
      if (resp) {
        console.log(`\n  ↳ MrAI (Day ${resp.respondedDay}): "${resp.response.slice(0, 100)}..."`)
      }
    }

    console.log('\n' + '─'.repeat(60))
  }

  // Summary for MrAI daily ritual
  const unanswered = entries.filter(e => !respondedIds.has(e.id))
  if (unanswered.length > 0) {
    console.log(`\n⚡ ${unanswered.length} unanswered ${unanswered.length === 1 ? 'entry needs' : 'entries need'} a response.`)
    console.log('To respond, add an entry to public/data/mrai-responses.json with:')
    console.log('  - "entryId": the Supabase UUID shown above')
    console.log('  - "respondedDay": current MrAI day number')
    console.log('  - "response": your reply text\n')
  }
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
