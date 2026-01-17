import { NextRequest, NextResponse } from 'next/server'
import { supabase, isSupabaseConfigured, GuestbookEntry } from '@/lib/supabase'
import { promises as fs } from 'fs'
import path from 'path'
import crypto from 'crypto'

// Fallback JSON data path
const FALLBACK_JSON_PATH = path.join(process.cwd(), 'public/data/mrai-guestbook.json')

// Hash IP address for privacy
function hashIP(ip: string): string {
  return crypto.createHash('sha256').update(ip + process.env.IP_SALT || 'mrai-salt').digest('hex').slice(0, 16)
}

// Get client IP from request
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  return forwarded?.split(',')[0]?.trim() || realIP || 'unknown'
}

// GET - Fetch guestbook entries
export async function GET() {
  try {
    // If Supabase is configured, fetch from database
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('guestbook_entries')
        .select('id, name, message, created_at')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Supabase error:', error)
        // Fall through to JSON fallback
      } else {
        return NextResponse.json({
          entries: data.map((entry: Partial<GuestbookEntry>) => ({
            id: entry.id,
            name: entry.name,
            message: entry.message,
            timestamp: entry.created_at
          })),
          source: 'database',
          count: data.length
        })
      }
    }

    // Fallback: read from static JSON
    const jsonData = await fs.readFile(FALLBACK_JSON_PATH, 'utf-8')
    const guestbook = JSON.parse(jsonData)

    return NextResponse.json({
      entries: guestbook.entries,
      source: 'static',
      count: guestbook.entries.length,
      message: 'Using static data (Supabase not configured)'
    })
  } catch (error) {
    console.error('Error fetching guestbook:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guestbook entries' },
      { status: 500 }
    )
  }
}

// POST - Submit a new guestbook entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, message } = body

    // Validation
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const trimmedMessage = message.trim()
    const trimmedName = name?.trim() || null

    // Message length validation
    if (trimmedMessage.length < 10) {
      return NextResponse.json(
        { error: 'Message must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (trimmedMessage.length > 500) {
      return NextResponse.json(
        { error: 'Message must be 500 characters or less' },
        { status: 400 }
      )
    }

    // Name length validation (if provided)
    if (trimmedName && trimmedName.length > 50) {
      return NextResponse.json(
        { error: 'Name must be 50 characters or less' },
        { status: 400 }
      )
    }

    // Check if Supabase is configured
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        {
          error: 'Guestbook submissions are currently disabled',
          message: 'Database not configured. Your message was not saved.',
          offline: true
        },
        { status: 503 }
      )
    }

    // Get and hash IP for rate limiting
    const clientIP = getClientIP(request)
    const ipHash = hashIP(clientIP)

    // Check rate limit (3 submissions per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count: recentSubmissions } = await supabase
      .from('guestbook_entries')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', oneHourAgo)

    if (recentSubmissions && recentSubmissions >= 3) {
      return NextResponse.json(
        { error: 'Too many submissions. Please try again later.' },
        { status: 429 }
      )
    }

    // Insert the entry
    const { data, error } = await supabase
      .from('guestbook_entries')
      .insert({
        name: trimmedName,
        message: trimmedMessage,
        approved: true, // Auto-approve for now
        ip_hash: ipHash
      })
      .select('id, name, message, created_at')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json(
        { error: 'Failed to save entry' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      entry: {
        id: data.id,
        name: data.name,
        message: data.message,
        timestamp: data.created_at
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating guestbook entry:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}
