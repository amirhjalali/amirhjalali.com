import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getRelevantContext } from '@/lib/embedding-service'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

// POST /api/notes/chat - Chat with notes using RAG
export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { message, chatId, notebookId } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get or create chat session
    let chat = chatId
      ? await prisma.noteChat.findUnique({ where: { id: chatId } })
      : null

    if (!chat) {
      chat = await prisma.noteChat.create({
        data: {
          title: message.substring(0, 50) + (message.length > 50 ? '...' : ''),
          notebookId,
          messages: [],
          messageCount: 0,
        },
      })
    }

    // Get existing messages
    const rawMessages = chat.messages
    const existingMessages = (Array.isArray(rawMessages) ? rawMessages : []) as unknown as ChatMessage[]

    // Get relevant context from notes using semantic search
    const { context, sources } = await getRelevantContext(message, {
      maxTokens: 4000,
      notebookId,
    })

    // Build system prompt with context
    const systemPrompt = `You are a helpful AI assistant that answers questions based on the user's notes and saved content.

${context ? `Here is relevant content from the user's notes:

${context}

---

Use this context to answer the user's questions. When referencing information, mention which source it came from. If the context doesn't contain relevant information, say so and provide general knowledge if appropriate.` : 'The user has no indexed notes yet, or no relevant content was found. Provide helpful general information.'}

Be concise but thorough. Format your responses with markdown when helpful.`

    // Prepare messages for OpenAI
    const messagesForOpenAI: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      ...existingMessages.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message },
    ]

    // Generate response using GPT-4
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messagesForOpenAI,
      temperature: 0.7,
      max_tokens: 1000,
    })

    const assistantMessage = completion.choices[0].message.content || 'I apologize, I could not generate a response.'

    // Update chat with new messages
    const updatedMessages = [
      ...existingMessages,
      { role: 'user' as const, content: message },
      { role: 'assistant' as const, content: assistantMessage },
    ]

    await prisma.noteChat.update({
      where: { id: chat.id },
      data: {
        messages: updatedMessages as any,
        messageCount: updatedMessages.length,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json({
      message: assistantMessage,
      chatId: chat.id,
      sources: sources.map(s => ({
        noteId: s.noteId,
        title: s.title,
      })),
    })
  } catch (error: any) {
    console.error('Chat error:', error)
    return NextResponse.json(
      { error: 'Failed to process chat', details: error.message },
      { status: 500 }
    )
  }
}

// GET /api/notes/chat - List chat sessions
export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const notebookId = searchParams.get('notebookId')
    const limit = parseInt(searchParams.get('limit') || '20')

    const chats = await prisma.noteChat.findMany({
      where: notebookId ? { notebookId } : {},
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        messageCount: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        notebook: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json({ chats })
  } catch (error: any) {
    console.error('List chats error:', error)
    return NextResponse.json(
      { error: 'Failed to list chats' },
      { status: 500 }
    )
  }
}
