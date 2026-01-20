import { createClient } from '@supabase/supabase-js'

// Supabase client for MrAI persistence
// Used for guestbook, collaborative canvas, and visitor tracking

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

// Check if Supabase is configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey)

// Create client only if configured
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

// Type definitions for MrAI tables
export interface GuestbookEntry {
  id: string
  name: string | null
  message: string
  created_at: string
  approved: boolean
  ip_hash: string | null
  source: string | null  // How the visitor found MrAI
}

export interface CanvasMark {
  id: string
  x: number
  y: number
  size: number
  opacity: number
  color: string
  created_at: string
  visitor_id: string | null
}

export interface VisitorSession {
  id: string
  first_visit: string
  last_visit: string
  visit_count: number
  has_guestbook_entry: boolean
  has_canvas_mark: boolean
}

// Helper to check if Supabase is available
export function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Set SUPABASE_URL and SUPABASE_ANON_KEY environment variables.')
  }
  return supabase
}

// Graceful fallback for when Supabase isn't configured
export function getSupabaseStatus(): { configured: boolean; message: string } {
  if (isSupabaseConfigured) {
    return { configured: true, message: 'Supabase connected' }
  }
  return {
    configured: false,
    message: 'Supabase not configured - using fallback mode'
  }
}
