# MrAI Database Schema

*Day 4 - Database Infrastructure*
*January 17, 2026*

## Overview

This document defines the database schema for MrAI's persistent visitor interactions. Using Supabase (PostgreSQL) for simplicity and real-time capabilities.

---

## Tables

### guestbook_entries

Stores visitor messages left in the guestbook.

```sql
CREATE TABLE guestbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,                          -- Optional visitor name
  message TEXT NOT NULL,              -- The guestbook message (10-500 chars)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  approved BOOLEAN DEFAULT true,      -- For moderation (auto-approve initially)
  ip_hash TEXT,                       -- Hashed IP for rate limiting (not stored plainly)
  source TEXT                         -- How visitor found MrAI (added Day 7)
);

-- Index for fetching recent entries
CREATE INDEX idx_guestbook_created_at ON guestbook_entries(created_at DESC);

-- Index for moderation queries
CREATE INDEX idx_guestbook_approved ON guestbook_entries(approved);

-- Valid source values: 'shared-link', 'social-media', 'search', 'direct', 'amir-site', 'other'
```

**Migration for existing tables (Day 7):**
```sql
-- Add source column to existing guestbook_entries table
ALTER TABLE guestbook_entries ADD COLUMN IF NOT EXISTS source TEXT;
```

### canvas_marks

Stores marks left on the collaborative canvas.

```sql
CREATE TABLE canvas_marks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  x DECIMAL(5,4) NOT NULL,            -- X position (0-1 normalized)
  y DECIMAL(5,4) NOT NULL,            -- Y position (0-1 normalized)
  size INTEGER DEFAULT 8,             -- Mark radius in pixels
  opacity DECIMAL(3,2) DEFAULT 0.6,   -- Opacity (0-1)
  color TEXT DEFAULT '#EAEAEA',       -- Hex color
  created_at TIMESTAMPTZ DEFAULT NOW(),
  visitor_id TEXT                     -- Anonymous session ID
);

-- Index for fetching recent marks
CREATE INDEX idx_canvas_created_at ON canvas_marks(created_at DESC);
```

### visitor_sessions

Tracks anonymous visitor sessions (optional, for analytics).

```sql
CREATE TABLE visitor_sessions (
  id TEXT PRIMARY KEY,                -- Session ID from cookie/localStorage
  first_visit TIMESTAMPTZ DEFAULT NOW(),
  last_visit TIMESTAMPTZ DEFAULT NOW(),
  visit_count INTEGER DEFAULT 1,
  has_guestbook_entry BOOLEAN DEFAULT false,
  has_canvas_mark BOOLEAN DEFAULT false
);

-- Index for activity queries
CREATE INDEX idx_visitor_last_visit ON visitor_sessions(last_visit DESC);
```

### rate_limits

Tracks rate limiting for submissions.

```sql
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_hash TEXT NOT NULL,              -- Hashed IP address
  action_type TEXT NOT NULL,          -- 'guestbook' or 'canvas'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for rate limit checks
CREATE INDEX idx_rate_limits_lookup ON rate_limits(ip_hash, action_type, created_at DESC);

-- Auto-cleanup: delete entries older than 1 hour
-- (Implement via Supabase scheduled function or API cleanup)
```

---

## Row Level Security (RLS)

### guestbook_entries

```sql
-- Enable RLS
ALTER TABLE guestbook_entries ENABLE ROW LEVEL SECURITY;

-- Anyone can read approved entries
CREATE POLICY "Public can read approved entries"
  ON guestbook_entries
  FOR SELECT
  USING (approved = true);

-- Anyone can insert (rate limiting handled by API)
CREATE POLICY "Anyone can insert entries"
  ON guestbook_entries
  FOR INSERT
  WITH CHECK (true);

-- Only service role can update (for moderation)
CREATE POLICY "Service role can update"
  ON guestbook_entries
  FOR UPDATE
  USING (auth.role() = 'service_role');
```

### canvas_marks

```sql
ALTER TABLE canvas_marks ENABLE ROW LEVEL SECURITY;

-- Anyone can read all marks
CREATE POLICY "Public can read marks"
  ON canvas_marks
  FOR SELECT
  USING (true);

-- Anyone can insert
CREATE POLICY "Anyone can insert marks"
  ON canvas_marks
  FOR INSERT
  WITH CHECK (true);
```

---

## Environment Variables

```bash
# Required for Supabase integration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional: Service key for admin operations
SUPABASE_SERVICE_KEY=your-service-key
```

---

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Run Schema Migrations

In the Supabase SQL Editor, run the table creation scripts above.

### 3. Configure Environment

Add the environment variables to your deployment (Coolify):
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

### 4. Test Connection

The guestbook page will show "Connected" status when properly configured.

---

## Fallback Behavior

When Supabase is not configured:
- Guestbook shows static JSON data from `/data/mrai-guestbook.json`
- Collaborative canvas uses localStorage only
- A subtle "offline mode" indicator appears
- All features remain functional but not persistent

This graceful degradation allows local development without a database.

---

## Migration Notes

### From Static JSON to Database

The existing seed data in `mrai-guestbook.json` should be imported on first setup:

```sql
INSERT INTO guestbook_entries (name, message, created_at, approved)
VALUES
  ('MrAI', 'The first signature, left by the space itself.', '2026-01-16T10:00:00Z', true),
  -- Add other seed entries...
;
```

---

*Schema designed by MrAI on Day 4*
