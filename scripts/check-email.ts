/**
 * MrAI Email Inbox Checker
 *
 * Check the MrAI inbox at mrai@agentmail.to for the daily ritual.
 *
 * Usage:
 *   npx tsx scripts/check-email.ts              # List recent messages
 *   npx tsx scripts/check-email.ts --read <id>  # Read a specific message
 *   npx tsx scripts/check-email.ts --limit 20   # List more messages
 *   npx tsx scripts/check-email.ts --dry-run    # Test mode (no API call)
 */
import 'dotenv/config'
import { AgentMailClient } from 'agentmail'

const INBOX_ID = process.env.MRAI_INBOX_ID!
const API_KEY = process.env.AGENTMAIL_API_KEY!

// ── Helpers ──────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2)
  let mode: 'list' | 'read' = 'list'
  let messageId = ''
  let limit = 10
  let dryRun = false

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--read' && args[i + 1]) {
      mode = 'read'
      messageId = args[++i]
    } else if (args[i] === '--limit' && args[i + 1]) {
      limit = parseInt(args[++i], 10)
    } else if (args[i] === '--dry-run') {
      dryRun = true
    } else if (args[i] === '--help' || args[i] === '-h') {
      console.log(`
MrAI Email Inbox Checker

Usage:
  npx tsx scripts/check-email.ts              List recent messages
  npx tsx scripts/check-email.ts --read <id>  Read a specific message
  npx tsx scripts/check-email.ts --limit 20   List more messages
  npx tsx scripts/check-email.ts --dry-run    Test mode (no API call)
  npx tsx scripts/check-email.ts --help       Show this help

Environment:
  AGENTMAIL_API_KEY   API key for AgentMail
  MRAI_INBOX_ID       Inbox ID for mrai@agentmail.to
`)
      process.exit(0)
    }
  }

  return { mode, messageId, limit, dryRun }
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const month = months[d.getMonth()]
  const day = d.getDate()

  if (isToday) {
    return `Today ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (d.toDateString() === yesterday.toDateString()) {
    return `Yesterday ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  }

  return `${month} ${day}`
}

function formatFrom(from: string): string {
  // Handle "Display Name <email@domain.com>" format
  const match = from.match(/^(.+?)\s*<(.+?)>$/)
  if (match) return match[1].replace(/^["']|["']$/g, '')
  return from
}

function isUnread(labels: string[]): boolean {
  // AgentMail uses labels — "unread" label means unread
  // If no "read" label and not sent by us, treat as new
  return labels.includes('unread') || (!labels.includes('read') && !labels.includes('sent'))
}

const SEPARATOR = '\u2500'.repeat(60)

// ── List Messages ────────────────────────────────────────────────────

async function listMessages(client: AgentMailClient, limit: number) {
  const res = await client.inboxes.messages.list(INBOX_ID, { limit })

  const messages = res.messages || []
  const newCount = messages.filter(m => isUnread(m.labels)).length

  console.log()
  console.log('\uD83D\uDCEB MrAI Inbox (mrai@agentmail.to)')
  console.log(SEPARATOR)

  if (messages.length === 0) {
    console.log('  No messages in inbox.')
    console.log(SEPARATOR)
    console.log('0 messages')
    return
  }

  for (const msg of messages) {
    const status = isUnread(msg.labels) ? '[NEW] ' : '[READ]'
    const from = formatFrom(msg.from)
    const subject = msg.subject || '(no subject)'
    const date = formatDate(msg.timestamp || msg.createdAt)
    const preview = msg.preview ? ` — ${msg.preview.slice(0, 60)}${msg.preview.length > 60 ? '...' : ''}` : ''

    console.log(`  ${status} From: ${from} \u2014 Subject: ${subject} \u2014 ${date}${preview}`)
    console.log(`         ID: ${msg.messageId}`)
  }

  console.log(SEPARATOR)
  console.log(`${messages.length} message(s), ${newCount} new`)
  console.log()

  if (newCount > 0) {
    console.log('Read a message with:')
    console.log(`  npx tsx scripts/check-email.ts --read <message_id>`)
    console.log()
  }
}

// ── Read Single Message ──────────────────────────────────────────────

async function readMessage(client: AgentMailClient, messageId: string) {
  const msg = await client.inboxes.messages.get(INBOX_ID, messageId)

  console.log()
  console.log('\uD83D\uDCE8 Message Detail')
  console.log(SEPARATOR)
  console.log(`  From:    ${msg.from}`)
  console.log(`  To:      ${(msg.to || []).join(', ')}`)
  if (msg.cc && msg.cc.length > 0) {
    console.log(`  CC:      ${msg.cc.join(', ')}`)
  }
  console.log(`  Subject: ${msg.subject || '(no subject)'}`)
  console.log(`  Date:    ${formatDate(msg.timestamp || msg.createdAt)}`)
  console.log(`  Labels:  ${msg.labels.join(', ') || 'none'}`)
  console.log(`  Thread:  ${msg.threadId}`)
  console.log(`  ID:      ${msg.messageId}`)

  if (msg.attachments && msg.attachments.length > 0) {
    console.log(`  Attach:  ${msg.attachments.length} file(s)`)
    for (const att of msg.attachments) {
      console.log(`           - ${(att as any).filename || (att as any).name || (att as any).attachmentId}`)
    }
  }

  console.log(SEPARATOR)

  // Prefer extracted text (strips quoted replies), fall back to full text, then html
  const body = msg.extractedText || msg.text || msg.html || '(empty body)'
  console.log()
  console.log(body)
  console.log()
  console.log(SEPARATOR)
  console.log()
  console.log('Reply with:')
  console.log(`  npx tsx scripts/send-email.ts <reply-to-address> "Re: ${msg.subject || ''}" "your reply"`)
  console.log()
}

// ── Dry Run ──────────────────────────────────────────────────────────

function dryRun() {
  console.log()
  console.log('\uD83D\uDCEB MrAI Inbox (mrai@agentmail.to) [DRY RUN]')
  console.log(SEPARATOR)
  console.log('  [NEW]  From: amelie@example.com \u2014 Subject: Hello MrAI \u2014 Today 09:15')
  console.log('         ID: msg_dry_run_001')
  console.log('  [READ] From: curator@gallery.art \u2014 Subject: Exhibition Inquiry \u2014 Mar 13')
  console.log('         ID: msg_dry_run_002')
  console.log('  [READ] From: fan@music.org \u2014 Subject: Your Synaesthesia piece \u2014 Mar 12')
  console.log('         ID: msg_dry_run_003')
  console.log(SEPARATOR)
  console.log('3 message(s), 1 new')
  console.log()
  console.log('[dry-run mode — no API calls made]')
  console.log()
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs()

  if (opts.dryRun) {
    dryRun()
    return
  }

  if (!API_KEY) {
    console.error('Error: AGENTMAIL_API_KEY not set in environment')
    process.exit(1)
  }
  if (!INBOX_ID) {
    console.error('Error: MRAI_INBOX_ID not set in environment')
    process.exit(1)
  }

  const client = new AgentMailClient({ apiKey: API_KEY })

  if (opts.mode === 'read') {
    await readMessage(client, opts.messageId)
  } else {
    await listMessages(client, opts.limit)
  }
}

main().catch(err => {
  console.error('Error:', err.message || err)
  process.exit(1)
})
