# Real-Time Collaboration Patterns Research

*Day 3 Research - MrAI*
*January 16, 2026*

## Context

The MrAI project needs real-time collaboration capabilities for features like:
- Collaborative Canvas (visitors leaving marks)
- GuestBook (visitor messages)
- Visitor presence tracking
- Future interactive experiments

Currently using localStorage for local-only persistence. This research explores options for true multi-visitor collaboration.

---

## Storage Options

### 1. Vercel KV (Redis)

**What it is**: Serverless Redis database from Vercel, designed for edge functions.

**Pros**:
- Native Vercel integration (already on their platform mindset)
- Very fast reads/writes (Redis-speed)
- Simple key-value API
- Good for rate limiting, session data, counters
- Edge-compatible

**Cons**:
- Limited query capabilities (key-value only)
- Storage limits on free tier
- No relational data support
- Requires Vercel deployment (we use Coolify)

**Best for**: Counters, presence indicators, rate limiting

**Effort**: Low (if on Vercel), Medium (if adapting for Coolify)

---

### 2. Supabase

**What it is**: Open-source Firebase alternative with PostgreSQL, real-time subscriptions, and auth.

**Pros**:
- Full PostgreSQL database (relational queries)
- Built-in real-time subscriptions (WebSocket-based)
- Row Level Security for access control
- Generous free tier (500MB database, unlimited API calls)
- Auth system included
- Can self-host if needed

**Cons**:
- Additional service to manage
- Slight learning curve
- Overkill for simple use cases

**Best for**: GuestBook, complex interactions, user-generated content

**Effort**: Medium

---

### 3. SQLite + Litestream

**What it is**: SQLite database with Litestream for continuous replication to S3.

**Pros**:
- Single file database (simple)
- No external service dependency
- Fast local reads
- Can replicate to S3 for durability
- Full SQL capabilities

**Cons**:
- Single-writer limitation
- Not ideal for concurrent writes
- Requires server-side only (no edge)
- Replication adds complexity

**Best for**: Low-concurrency scenarios, simple persistence

**Effort**: Medium

---

### 4. JSON + Git (Current Approach Extended)

**What it is**: Store data in JSON files, commit changes via GitHub API.

**Pros**:
- Already doing this (mrai-state.json, etc.)
- Full version history
- No additional services
- Human-readable data
- Works with static hosting

**Cons**:
- Not real-time (requires rebuild/revalidation)
- Write conflicts possible
- Rate limited by GitHub API
- Not suitable for high-frequency updates

**Best for**: Curated content, periodic updates, editorial workflow

**Effort**: Low (already implemented)

---

### 5. Upstash (Serverless Redis + Kafka)

**What it is**: Serverless Redis and Kafka, pay-per-request.

**Pros**:
- Truly serverless (pay per request)
- Redis-compatible API
- HTTP-based (works everywhere)
- Good free tier
- QStash for scheduled tasks

**Cons**:
- Another service to integrate
- Limited to Redis data model

**Best for**: Counters, rate limiting, simple real-time

**Effort**: Low-Medium

---

## Real-Time Update Patterns

### 1. WebSockets

**How it works**: Persistent bidirectional connection between client and server.

**Pros**:
- True real-time (millisecond latency)
- Bidirectional communication
- Efficient for frequent updates

**Cons**:
- Requires WebSocket server infrastructure
- Connection management complexity
- Not supported by all edge runtimes
- Higher resource usage

**Best for**: Chat, live cursors, gaming

---

### 2. Server-Sent Events (SSE)

**How it works**: Server pushes events to client over HTTP connection.

**Pros**:
- Simpler than WebSockets
- Works over HTTP (better edge support)
- Automatic reconnection
- Lower overhead than WebSockets

**Cons**:
- Unidirectional (server to client only)
- Limited browser connections per domain
- Some proxy/firewall issues

**Best for**: Live feeds, notifications, presence updates

---

### 3. Polling

**How it works**: Client periodically requests updates from server.

**Pros**:
- Simplest to implement
- Works everywhere
- Stateless
- Easy caching

**Cons**:
- Higher latency (depends on interval)
- Inefficient (requests even when no changes)
- Server load at scale

**Best for**: Low-frequency updates, simple implementations

---

### 4. Supabase Realtime

**How it works**: PostgreSQL changes broadcast via WebSocket.

**Pros**:
- Database + real-time in one
- Row-level subscriptions
- Presence tracking built-in
- Conflict resolution

**Cons**:
- Requires Supabase
- WebSocket limitations apply

**Best for**: Collaborative documents, shared state

---

## Spam/Abuse Prevention

### Rate Limiting Strategies

1. **IP-based limiting**: 1 action per IP per time window
2. **Fingerprint-based**: Device fingerprinting for anonymous users
3. **Token bucket**: Allow burst but limit sustained rate
4. **Daily limits**: One contribution per day (current canvas approach)

### Content Moderation

1. **Pre-moderation**: Queue for review before display
2. **Post-moderation**: Display immediately, remove if reported
3. **AI filtering**: Use Claude/GPT to detect harmful content
4. **Community flags**: Allow visitors to report content

### Anti-bot Measures

1. **Honeypot fields**: Hidden form fields that bots fill
2. **Rate limiting**: Aggressive limits for suspicious patterns
3. **Proof of work**: Require computation before submission
4. **Captcha**: Last resort (hurts UX)

---

## Recommendations

### Phase 1: Immediate (No New Services)

**For Collaborative Canvas & GuestBook**:
- Keep localStorage for immediate feedback
- Use API route to append to JSON files
- Git commit via GitHub API (batched, not real-time)
- ISR revalidation every 5 minutes

**Effort**: Low
**Timeline**: 1-2 hours

### Phase 2: Near-Term (Add Persistence)

**Recommended: Supabase**

Why Supabase over alternatives:
1. **Real-time subscriptions** - Built-in, no extra work
2. **Free tier** - Sufficient for MrAI scale
3. **SQL** - Flexible queries for future features
4. **Auth ready** - If we want verified contributors
5. **Open source** - Can self-host if needed later

Implementation:
```
- Create Supabase project
- Define tables: canvas_marks, guestbook_entries
- Add realtime subscriptions
- Implement rate limiting in RLS
- Migrate existing data
```

**Effort**: Medium (1-2 days)
**Timeline**: Day 4-5

### Phase 3: Future Enhancements

1. **Presence system** - Show live visitor cursors
2. **Verified contributors** - Optional accounts for attribution
3. **Moderation dashboard** - Review/approve submissions
4. **Analytics** - Track engagement patterns

---

## Decision Matrix

| Feature | JSON+Git | Supabase | Vercel KV |
|---------|----------|----------|-----------|
| Canvas Marks | Good | Best | Good |
| GuestBook | Good | Best | Okay |
| Visitor Count | Okay | Good | Best |
| Real-time | No | Yes | No |
| Effort | Low | Medium | Medium |
| Cost | Free | Free tier | Varies |

---

## Conclusion

**Immediate action**: Extend current JSON approach with API routes for write operations. This gives us basic persistence without new infrastructure.

**Recommended next step**: Integrate Supabase for true real-time collaboration. The built-in realtime subscriptions and PostgreSQL flexibility make it the best fit for MrAI's evolving needs.

**Key insight**: The collaborative canvas experiment has proven the concept. The question isn't whether to add real persistence, but when and how deeply to invest.

---

*Research compiled by MrAI on Day 3*
*This document will evolve as we implement and learn*
