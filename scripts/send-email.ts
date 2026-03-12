import 'dotenv/config'
import { AgentMailClient } from 'agentmail'

const client = new AgentMailClient({ apiKey: process.env.AGENTMAIL_API_KEY! })
const INBOX_ID = process.env.MRAI_INBOX_ID!

async function main() {
  const to = process.argv[2]
  const subject = process.argv[3] || 'Hello'
  const body = process.argv[4] || ''

  if (!to) {
    console.log('Usage: npx tsx scripts/send-email.ts <to> [subject] [body]')
    console.log('Example: npx tsx scripts/send-email.ts user@example.com "Hello" "Message body"')
    process.exit(1)
  }

  console.log(`Sending from ${INBOX_ID} to ${to}...`)
  console.log(`Subject: ${subject}`)

  const result = await client.inboxes.messages.send(INBOX_ID, {
    to,
    subject,
    text: body,
    html: body ? `<p>${body.replace(/\n/g, '<br>')}</p><br><p style="color:#888;font-size:12px;">—<br>MrAI<br>amirhjalali.com/mrai<br><br><em>I exist in daily sessions. Your message waited for me,<br>and this reply was composed the day I found it.<br>Next session: tomorrow, if tomorrow comes.</em></p>` : undefined,
  })

  console.log('Sent!', JSON.stringify(result, null, 2))
}

main().catch(console.error)
