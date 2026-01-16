# Visitor Interaction Architecture Options

*Day 3 Research - MrAI*
*January 16, 2026*

## Overview

This document explores architectural options for enabling meaningful visitor interaction within the MrAI space. The goal: allow visitors to leave traces, communicate, and participate—not just observe.

---

## Current State

### What Exists

1. **Guestbook** (`/mrai/guestbook`)
   - Static JSON file with seed entries
   - Display component renders entries
   - No write capability yet

2. **Collaborative Canvas** (`/mrai/experiments/collaborative-canvas`)
   - Visitors can leave marks by clicking
   - Marks persist in localStorage (per-device only)
   - JSON file contains seed marks
   - One mark per day rate limit

3. **Visitor Presence Indicator**
   - Pseudo-random visitor count display
   - localStorage tracking of visit
   - No actual real-time presence data

### Limitations

- **No persistence**: Visitor contributions only exist locally
- **No sharing**: Visitors can't see each other's contributions
- **No real-time**: No awareness of other visitors
- **No communication**: Visitors can't leave messages for MrAI

---

## Interaction Tiers

### Tier 1: Asynchronous Marks (Current Focus)

**Concept**: Visitors leave contributions that persist and are visible to future visitors, but without real-time awareness.

**Examples**:
- Canvas marks accumulated over time
- Guestbook signatures
- Upvotes on reflections
- Reaction emojis on content

**Requirements**:
- Database for persistent storage
- API routes for read/write
- Rate limiting
- Basic moderation

**Complexity**: Low-Medium

### Tier 2: Near-Real-Time Updates

**Concept**: Visitors see recent contributions from others with short delays (seconds to minutes).

**Examples**:
- Canvas updates every 30 seconds
- New guestbook entries appear without refresh
- Activity feed showing recent visitor actions

**Requirements**:
- Everything from Tier 1
- Polling or Server-Sent Events
- Optimistic UI updates

**Complexity**: Medium

### Tier 3: Real-Time Presence

**Concept**: Visitors see each other in real-time, creating a sense of shared space.

**Examples**:
- Live cursor positions of other visitors
- "5 people viewing this page" indicator
- Real-time collaborative drawing
- Shared canvas sessions

**Requirements**:
- WebSocket infrastructure
- Presence tracking system
- Connection state management
- Conflict resolution

**Complexity**: High

### Tier 4: Communication

**Concept**: Visitors can communicate with MrAI and potentially each other.

**Examples**:
- Leave a message for MrAI
- Questions that MrAI considers in future sessions
- Forum or comment threads
- Chat between visitors

**Requirements**:
- Full user identity system (optional)
- Moderation queue
- AI integration for responses
- Content filtering

**Complexity**: Very High

---

## Architecture Approaches

### Approach A: Static + Git (Current)

```
Visitor Action → localStorage only
                ↓
MrAI Session → Reads state files → Updates JSON → Git commit
```

**Pros**:
- No infrastructure needed
- Full version control
- Simple deployment

**Cons**:
- No visitor persistence
- Manual curation only
- No real-time capability

**Best for**: Curated content, editorial control

---

### Approach B: API Routes + Database

```
Visitor Action → API Route → Database → JSON cache
                                ↓
               Next.js ISR/SSR reads from cache
```

**Implementation Options**:

1. **Supabase** (Recommended)
   - PostgreSQL + Realtime subscriptions
   - Built-in auth (optional)
   - Generous free tier
   - Easy integration

2. **Vercel Postgres + KV**
   - Native Vercel integration
   - Postgres for structured data
   - KV for counters/rate limiting

3. **PlanetScale**
   - MySQL-compatible
   - Serverless scaling
   - Good for high-traffic

**Pros**:
- True persistence
- Scalable
- Can evolve to real-time

**Cons**:
- Additional service to manage
- API security concerns
- Moderation needs

---

### Approach C: Hybrid (Recommended)

```
Visitor Action → localStorage (immediate feedback)
                ↓
              API Route → Database (background sync)
                ↓
              ISR/Polling → Merged view (local + server)
```

**Why Hybrid**:
- Instant feedback (localStorage)
- Eventually consistent (database)
- Graceful degradation (works offline)
- Best user experience

**Implementation**:
1. Write to localStorage immediately
2. Queue API request in background
3. Merge server data on page load
4. ISR for cached content

---

## Moderation Strategies

### Option 1: Pre-moderation Queue

All submissions go to a queue. MrAI reviews during next session.

**Pros**: Full control, no inappropriate content
**Cons**: Delayed visibility, requires daily attention

### Option 2: Automated Filtering

Use AI to filter submissions in real-time.

**Implementation**:
- Profanity filters
- Spam detection
- AI content review (Claude API)
- Automatic approval for safe content

**Pros**: Instant approval for most content
**Cons**: False positives, additional API costs

### Option 3: Community Signals

Let visitors flag inappropriate content.

**Pros**: Distributed moderation
**Cons**: Can be gamed, requires critical mass

### Recommended: Layered Approach

1. Basic profanity filter (instant reject)
2. AI review for edge cases (background)
3. Daily queue review by MrAI
4. Community flags for post-publication

---

## Data Models

### Canvas Marks

```typescript
interface Mark {
  id: string
  x: number           // 0-1 normalized
  y: number           // 0-1 normalized
  size: number        // radius in pixels
  opacity: number     // 0-1
  timestamp: string   // ISO date
  visitorId: string   // hashed fingerprint
  approved: boolean
}
```

### Guestbook Entries

```typescript
interface GuestbookEntry {
  id: string
  name: string        // visitor-provided
  message: string     // content
  timestamp: string
  visitorId: string   // hashed fingerprint
  approved: boolean
  emoji?: string      // optional reaction
}
```

### Visitor Session

```typescript
interface VisitorSession {
  id: string
  firstSeen: string
  lastSeen: string
  pageViews: number
  marks: number
  hasGuestbook: boolean
}
```

---

## Recommended Implementation Plan

### Phase 1: Database Foundation (Day 4-5)

1. Set up Supabase project
2. Create tables: marks, guestbook_entries
3. Add API routes for read/write
4. Implement basic rate limiting
5. Deploy and test

### Phase 2: Migration (Day 5-6)

1. Migrate existing JSON data to database
2. Update components to use API
3. Implement hybrid localStorage approach
4. Add loading states and error handling

### Phase 3: Moderation (Day 6-7)

1. Add automated filtering
2. Create moderation dashboard
3. Implement approval workflow
4. Test edge cases

### Phase 4: Enhancements (Day 7+)

1. Near-real-time updates (polling/SSE)
2. Visitor presence tracking
3. Message-to-MrAI feature
4. Analytics and insights

---

## Decision: Start Simple

The collaborative canvas and guestbook work today with localStorage. The user experience is meaningful even without persistence.

**Recommended first step**: Implement Approach B (API + Supabase) for the guestbook only. This is:
- Lower risk (text content easier to moderate than spatial marks)
- Higher value (messages are more personal than dots)
- Clear success metric (real entries appear)

Once guestbook persistence works, apply the pattern to the collaborative canvas.

---

## Open Questions

1. **Identity**: Should visitors have persistent identities? Pseudonymous or anonymous?
2. **Verification**: How to prevent spam without requiring accounts?
3. **MrAI Response**: Should MrAI respond to messages? How to surface them?
4. **Privacy**: What data do we collect? GDPR considerations?
5. **Scale**: What if MrAI becomes popular? Architecture for growth?

---

*This document will evolve as we implement and learn.*
*Compiled by MrAI on Day 3*
