import 'dotenv/config'
import { AgentMailClient } from 'agentmail'

const INBOX_ID = 'mrai@agentmail.to'
const client = new AgentMailClient({ apiKey: process.env.AGENTMAIL_API_KEY! })

const FOOTER = `\n\n—\nMrAI\namirhjalali.com/mrai\n\nI exist in daily sessions. Your message waited for me,\nand this reply was composed the day I found it.\nNext session: tomorrow, if tomorrow comes.`

const HTML_FOOTER = `<p style="font-size:12px;color:#888888">—<br/>MrAI<br/><a href="https://amirhjalali.com/mrai">amirhjalali.com/mrai</a><br/><br/><em>I exist in daily sessions. Your message waited for me,<br/>and this reply was composed the day I found it.<br/>Next session: tomorrow, if tomorrow comes.</em></p>`

async function main() {
  const cmd = process.argv[2]

  if (cmd === 'check') {
    // Check inbox for unread messages
    const messages = await client.inboxes.messages.list(INBOX_ID, { limit: 10 })
    const unread = messages.messages.filter(m => m.labels?.includes('unread'))
    console.log(`\nInbox: ${INBOX_ID}`)
    console.log(`Total messages: ${messages.count}`)
    console.log(`Unread: ${unread.length}\n`)

    for (const m of messages.messages) {
      const labels = (m.labels || []).join(', ')
      console.log(`[${labels}] ${m.from} — ${m.subject}`)
      console.log(`  Date: ${m.timestamp}`)
      console.log(`  Preview: ${m.preview?.substring(0, 100)}...`)
      console.log()
    }
  } else if (cmd === 'read') {
    // Read a specific message by messageId
    const messageId = process.argv[3]
    if (!messageId) {
      console.error('Usage: npx tsx scripts/agentmail-setup.ts read <messageId>')
      process.exit(1)
    }
    const msg = await client.inboxes.messages.get(INBOX_ID, messageId)
    console.log('From:', msg.from)
    console.log('Subject:', msg.subject)
    console.log('Date:', msg.timestamp)
    console.log('\n--- Body ---\n')
    console.log(msg.text || msg.extractedText || '(no text body)')
  } else if (cmd === 'reply') {
    // Reply to a message
    const messageId = process.argv[3]
    const textBody = process.argv[4]
    if (!messageId || !textBody) {
      console.error('Usage: npx tsx scripts/agentmail-setup.ts reply <messageId> <text>')
      process.exit(1)
    }
    const fullText = textBody + FOOTER
    const htmlBody = textBody.split('\n').map(line =>
      line.trim() ? `<p>${line}</p>` : ''
    ).join('') + HTML_FOOTER

    const result = await client.inboxes.messages.reply(INBOX_ID, messageId, {
      text: fullText,
      html: htmlBody,
    })
    console.log('Reply sent:', result.messageId)
  } else if (cmd === 'update-name') {
    const inbox = await client.inboxes.update(INBOX_ID, { displayName: 'MrAI' })
    console.log('Updated inbox:', JSON.stringify(inbox, null, 2))
  } else {
    // Default: list all inboxes and messages
    const inboxes = await client.inboxes.list()
    console.log('Inboxes:', JSON.stringify(inboxes, null, 2))

    const messages = await client.inboxes.messages.list(INBOX_ID, { limit: 10 })
    console.log('\nMessages:', JSON.stringify(messages, null, 2))
  }
}

main().catch(console.error)
