import 'dotenv/config'
import { AgentMailClient } from 'agentmail'

const client = new AgentMailClient({ apiKey: process.env.AGENTMAIL_API_KEY! })
const INBOX_ID = process.env.MRAI_INBOX_ID!

async function main() {
  const limit = parseInt(process.argv[2] || '10', 10)

  console.log(`Checking ${INBOX_ID} for messages...\n`)

  const res = await client.inboxes.messages.list(INBOX_ID, { limit })

  if (!res.messages || res.messages.length === 0) {
    console.log('No messages in inbox.')
    return
  }

  console.log(`Found ${res.messages.length} message(s):\n`)
  console.log('────────────────────────────────────────────────────────────\n')

  for (const msg of res.messages) {
    const from = typeof msg.from === 'string' ? msg.from : (msg.from as any)?.address || JSON.stringify(msg.from)
    const date = msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'unknown'
    const body = (msg as any).extractedText || (msg as any).text || (msg as any).bodyPreview || '(no body)'

    console.log(`From: ${from}`)
    console.log(`Date: ${date}`)
    console.log(`Subject: ${msg.subject || '(no subject)'}`)
    console.log(`Thread: ${(msg as any).threadId || 'N/A'}`)
    console.log(`\n  "${body.slice(0, 500)}"`)
    console.log('\n────────────────────────────────────────────────────────────\n')
  }
}

main().catch(console.error)
