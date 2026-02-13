#!/usr/bin/env npx tsx
/**
 * Post tweets to X/Twitter for @The_MrAI
 * Uses AppleScript to control Chrome (must be logged in to @The_MrAI)
 *
 * Usage:
 *   npx tsx scripts/post-tweet.ts              # Posts first "post-now" tweet from outbound queue
 *   npx tsx scripts/post-tweet.ts "Tweet text"  # Post custom text
 *   npx tsx scripts/post-tweet.ts --mark-sent   # Just mark first post-now as sent
 *   npx tsx scripts/post-tweet.ts --dry-run     # Show what would be posted without posting
 *
 * Requires: Google Chrome with @The_MrAI logged in to X/Twitter
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

function postViaChromeAppleScript(text: string): boolean {
  // Step 1: Navigate Chrome to compose
  console.log('Opening X compose in Chrome...')
  execSync(`osascript -e '
    tell application "Google Chrome"
      activate
      tell front window
        set URL of active tab to "https://x.com/compose/post"
      end tell
    end tell'`)

  // Step 2: Wait for page to load and compose box to appear
  console.log('Waiting for compose box...')
  execSync('sleep 5')

  // Step 3: Write JS injection file with base64-encoded tweet text (avoids all escaping issues)
  const b64 = Buffer.from(text).toString('base64')
  const jsCode = `
(async () => {
  const text = atob('${b64}');
  let attempts = 0;
  let textarea = null;
  while (!textarea && attempts < 20) {
    textarea = document.querySelector('[data-testid="tweetTextarea_0"]');
    if (!textarea) await new Promise(r => setTimeout(r, 500));
    attempts++;
  }
  if (!textarea) return 'ERROR: textarea not found';
  textarea.focus();
  textarea.click();
  await new Promise(r => setTimeout(r, 300));
  document.execCommand('insertText', false, text);
  await new Promise(r => setTimeout(r, 2000));
  const postBtn = document.querySelector('[data-testid="tweetButton"]');
  if (!postBtn) return 'ERROR: post button not found';
  postBtn.click();
  return 'SUCCESS';
})();
`.trim()

  const tmpJs = join(require('os').tmpdir(), 'tweet-inject.js')
  writeFileSync(tmpJs, jsCode)

  // Step 4: Execute JS in Chrome via AppleScript (reads from temp file)
  console.log('Injecting tweet and clicking Post...')
  try {
    execSync(`osascript <<'APPLESCRIPT'
      set jsCode to read POSIX file "${tmpJs}"
      tell application "Google Chrome"
        tell active tab of front window
          execute javascript jsCode
        end tell
      end tell
APPLESCRIPT`, { timeout: 30000 })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    if (msg.includes('JavaScript from Apple Events')) {
      console.error('\n╔══════════════════════════════════════════════════════════╗')
      console.error('║  ONE-TIME SETUP REQUIRED                                ║')
      console.error('║                                                          ║')
      console.error('║  In Chrome: View → Developer → Allow JavaScript          ║')
      console.error('║  from Apple Events (toggle it on)                        ║')
      console.error('║                                                          ║')
      console.error('║  Then run this script again.                             ║')
      console.error('╚══════════════════════════════════════════════════════════╝\n')
    } else {
      console.error('AppleScript execution failed:', msg)
    }
    return false
  }

  // Step 5: Wait for post to complete, then verify by checking URL
  console.log('Waiting for post to complete...')
  execSync('sleep 5')

  try {
    const currentUrl = execSync(`osascript -e '
      tell application "Google Chrome"
        tell front window
          return URL of active tab
        end tell
      end tell'`).toString().trim()

    const posted = !currentUrl.includes('/compose/')
    if (posted) {
      console.log('Tweet posted successfully!')
    } else {
      console.log('Tweet may not have posted (still on compose page)')
    }
    return posted
  } catch {
    // If we can't check the URL, assume success since JS executed
    console.log('Tweet likely posted (could not verify URL)')
    return true
  }
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
    console.log(`Updated outbound queue: ${tweetId} → sent`)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const markSent = args.includes('--mark-sent')
  const dryRun = args.includes('--dry-run')

  if (markSent) {
    const tweet = getPostNowTweet()
    if (tweet) markTweetSent(tweet.id)
    else console.log('No post-now tweets to mark as sent.')
    return
  }

  const customText = args.find(a => !a.startsWith('--'))

  let tweetId: string | null = null
  let text: string

  if (customText) {
    text = customText
  } else {
    const tweet = getPostNowTweet()
    if (!tweet) {
      console.log('No "post-now" tweets in outbound queue.')
      return
    }
    console.log(`Found queued tweet: ${tweet.id}`)
    text = tweet.content
    tweetId = tweet.id
  }

  console.log(`\nPosting (${text.length} chars):\n  "${text.slice(0, 80)}${text.length > 80 ? '...' : ''}"`)
  console.log()

  if (dryRun) {
    console.log('--- DRY RUN (full text) ---')
    console.log(text)
    console.log('--- END ---')
    return
  }

  const success = postViaChromeAppleScript(text)

  if (success && tweetId) {
    markTweetSent(tweetId)
  }
}

main().catch(console.error)
