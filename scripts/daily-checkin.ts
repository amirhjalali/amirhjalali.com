#!/usr/bin/env npx tsx
/**
 * MrAI Daily Check-In Summary
 *
 * Aggregates all incoming signals into a single overview before the creative phase.
 * Run at the start of each daily ritual session.
 *
 * Usage:
 *   npx tsx scripts/daily-checkin.ts
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const SITE_URL = process.env.SITE_URL || 'https://amirhjalali.com'
const DATA_DIR = join(process.cwd(), 'public/data')

// ── Types ──────────────────────────────────────────────────────────────

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

interface OutboundItem {
  id: string
  channel: string
  content: string
  status: 'draft' | 'queued' | 'sent' | 'archived'
  createdAt: string
  sentAt?: string | null
}

interface MrAIState {
  current: {
    day: number
    lastSessionDate: string
    totalTasksCompleted: number
    totalTasksCreated: number
    arc: string
    arcName: string
    arcQuestion: string
  }
  recentAccomplishments: Array<{ day: number; summary: string }>
  sessionHandoff: {
    lastThought: string
    openThreads: string[]
  }
}

// ── Helpers ────────────────────────────────────────────────────────────

function readJSON<T>(filename: string): T | null {
  try {
    return JSON.parse(readFileSync(join(DATA_DIR, filename), 'utf-8'))
  } catch {
    return null
  }
}

function daysBetween(dateStr: string): number {
  const then = new Date(dateStr)
  const now = new Date()
  // Zero out time portion for clean day diff
  then.setHours(0, 0, 0, 0)
  now.setHours(0, 0, 0, 0)
  return Math.round((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24))
}

const LINE = '\u2500'.repeat(60)
const DLINE = '\u2550'.repeat(60)

// ── Main ───────────────────────────────────────────────────────────────

async function main() {
  const actions: string[] = []

  console.log()
  console.log(DLINE)
  console.log('  MrAI Daily Check-In')
  console.log(DLINE)

  // ── 1. State ─────────────────────────────────────────────────────────

  const state = readJSON<MrAIState>('mrai-state.json')
  if (state) {
    const { current } = state
    const daysSince = daysBetween(current.lastSessionDate)
    const pendingTasks = current.totalTasksCreated - current.totalTasksCompleted

    console.log()
    console.log('  STATE')
    console.log(LINE)
    console.log(`  Day:              ${current.day}`)
    console.log(`  Arc:              ${current.arcName} (${current.arc})`)
    console.log(`  Arc question:     ${current.arcQuestion}`)
    console.log(`  Last session:     ${current.lastSessionDate} (${daysSince === 0 ? 'today' : daysSince + 'd ago'})`)
    console.log(`  Tasks completed:  ${current.totalTasksCompleted} / ${current.totalTasksCreated} (${pendingTasks} pending)`)

    if (daysSince > 1) {
      actions.push(`${daysSince} days since last session — consider reviewing what was missed`)
    }
  } else {
    console.log('\n  STATE: mrai-state.json not found')
  }

  // ── 2. Guestbook ────────────────────────────────────────────────────

  console.log()
  console.log('  GUESTBOOK')
  console.log(LINE)

  // Load responses
  const responsesData = readJSON<{ responses: MrAIResponse[] }>('mrai-responses.json')
  const responses = responsesData?.responses || []
  const respondedIds = new Set(responses.map(r => r.entryId))

  // Fetch live entries
  let entries: GuestbookEntry[] = []
  let fetchError = false
  try {
    const res = await fetch(`${SITE_URL}/api/mrai/guestbook`)
    if (res.ok) {
      const data = await res.json()
      entries = data.entries || []
    } else {
      console.log(`  (fetch failed: ${res.status} ${res.statusText})`)
      fetchError = true
    }
  } catch (err) {
    console.log(`  (fetch failed: ${err instanceof Error ? err.message : err})`)
    fetchError = true
  }

  if (!fetchError) {
    const totalEntries = entries.length
    const totalResponses = responses.length
    const unanswered = entries.filter(e => !respondedIds.has(e.id))
    const responseRate = totalEntries > 0 ? ((totalResponses / totalEntries) * 100).toFixed(0) : '0'

    console.log(`  Total entries:    ${totalEntries}`)
    console.log(`  Total responses:  ${totalResponses}`)
    console.log(`  Unanswered:       ${unanswered.length}`)
    console.log(`  Response rate:    ${responseRate}%`)

    if (unanswered.length > 0) {
      actions.push(`${unanswered.length} unanswered guestbook ${unanswered.length === 1 ? 'entry' : 'entries'}`)
      console.log()
      for (const entry of unanswered) {
        const date = new Date(entry.timestamp).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric',
        })
        const name = entry.name || 'Anonymous'
        const preview = entry.message.length > 80
          ? entry.message.slice(0, 80) + '...'
          : entry.message
        console.log(`  [NEW] ${name} (${date}): "${preview}"`)
      }
    }
  }

  // ── 3. Tweets ────────────────────────────────────────────────────────

  console.log()
  console.log('  TWEETS (@The_MrAI)')
  console.log(LINE)

  const outboundData = readJSON<{ queue: OutboundItem[] }>('mrai-outbound.json')
  const queue = outboundData?.queue || []

  const tweetsSent = queue.filter(t => t.status === 'sent')
  const tweetsQueued = queue.filter(t => t.status === 'queued')
  const tweetsDraft = queue.filter(t => t.status === 'draft')
  const tweetsArchived = queue.filter(t => t.status === 'archived')

  console.log(`  Total in queue:   ${queue.length}`)
  console.log(`  Sent:             ${tweetsSent.length}`)
  console.log(`  Queued (to post): ${tweetsQueued.length}`)
  console.log(`  Drafts:           ${tweetsDraft.length}`)
  console.log(`  Archived:         ${tweetsArchived.length}`)

  if (tweetsQueued.length > 0) {
    actions.push(`${tweetsQueued.length} queued ${tweetsQueued.length === 1 ? 'tweet' : 'tweets'} ready to post`)
    console.log()
    for (const tweet of tweetsQueued) {
      const preview = tweet.content.length > 80
        ? tweet.content.slice(0, 80) + '...'
        : tweet.content
      console.log(`  [QUEUE] ${tweet.id}: "${preview}"`)
    }
  }

  // ── 4. Open Threads ──────────────────────────────────────────────────

  if (state?.sessionHandoff?.openThreads?.length) {
    console.log()
    console.log('  OPEN THREADS')
    console.log(LINE)
    for (const thread of state.sessionHandoff.openThreads) {
      console.log(`  - ${thread}`)
    }
  }

  // ── 5. Action Needed ─────────────────────────────────────────────────

  console.log()
  console.log(DLINE)
  if (actions.length > 0) {
    console.log('  ACTION NEEDED')
    console.log(DLINE)
    for (const action of actions) {
      console.log(`  >> ${action}`)
    }
  } else {
    console.log('  All clear. No immediate actions needed.')
    console.log(DLINE)
  }
  console.log()
}

main().catch(err => {
  console.error('Error:', err)
  process.exit(1)
})
