#!/usr/bin/env npx tsx
/**
 * Post tweets to X/Twitter for @The_MrAI
 * Opens tweet intent URL in default browser (uses existing login session)
 *
 * Usage:
 *   npx tsx scripts/post-tweet.ts              # Posts first "post-now" tweet from outbound queue
 *   npx tsx scripts/post-tweet.ts "Tweet text"  # Post custom text
 */

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join } from 'path'
import { execSync } from 'child_process'

const OUTBOUND_PATH = join(process.cwd(), 'public/data/mrai-outbound.json')

interface OutboundTweet {
  id: string
  content: string
  status: string
  sentAt: string | null
  [key: string]: unknown
}

function openTweetIntent(text: string) {
  const encoded = encodeURIComponent(text)
  const url = `https://x.com/intent/post?text=${encoded}`

  console.log(`Opening tweet in browser (${text.length} chars):\n`)
  console.log(`  "${text.slice(0, 80)}${text.length > 80 ? '...' : ''}"`)
  console.log()

  // Open in default browser (macOS)
  execSync(`open "${url}"`)

  console.log('Tweet compose opened in your browser.')
  console.log('Make sure you are logged in as @The_MrAI, then click Post.')
}

function getPostNowTweet(): OutboundTweet | null {
  if (!existsSync(OUTBOUND_PATH)) return null
  const data = JSON.parse(readFileSync(OUTBOUND_PATH, 'utf-8'))
  return data.queue.find((t: OutboundTweet) => t.status === 'post-now') ?? null
}

function markTweetSent(tweetId: string) {
  const data = JSON.parse(readFileSync(OUTBOUND_PATH, 'utf-8'))
  const tweet = data.queue.find((t: OutboundTweet) => t.id === tweetId)
  if (tweet) {
    tweet.status = 'sent'
    tweet.sentAt = new Date().toISOString()
    writeFileSync(OUTBOUND_PATH, JSON.stringify(data, null, 2) + '\n')
    console.log(`\nUpdated outbound queue: ${tweetId} → sent`)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const customText = args.find(a => !a.startsWith('--'))
  const markSent = args.includes('--mark-sent')

  if (markSent) {
    const tweet = getPostNowTweet()
    if (tweet) markTweetSent(tweet.id)
    else console.log('No post-now tweets to mark as sent.')
    return
  }

  if (customText) {
    openTweetIntent(customText)
    return
  }

  // Find post-now tweet from queue
  const tweet = getPostNowTweet()
  if (!tweet) {
    console.log('No "post-now" tweets in outbound queue.')
    return
  }

  console.log(`Found queued tweet: ${tweet.id}\n`)
  openTweetIntent(tweet.content)
  markTweetSent(tweet.id)
}

main().catch(console.error)
