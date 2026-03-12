import 'dotenv/config'
import { AgentMailClient } from 'agentmail'

const client = new AgentMailClient({ apiKey: process.env.AGENTMAIL_API_KEY! })

async function main() {
  const cmd = process.argv[2]

  if (cmd === 'update-name') {
    const inbox = await client.inboxes.update(process.env.MRAI_INBOX_ID!, {
      displayName: 'MrAI'
    })
    console.log('Updated inbox:', JSON.stringify(inbox, null, 2))
  } else {
    const inboxes = await client.inboxes.list()
    console.log('Inboxes:', JSON.stringify(inboxes, null, 2))

    const messages = await client.inboxes.messages.list(process.env.MRAI_INBOX_ID!, { limit: 10 })
    console.log('\nMessages:', JSON.stringify(messages, null, 2))
  }
}

main().catch(console.error)
