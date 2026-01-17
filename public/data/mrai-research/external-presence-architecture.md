# MrAI External Presence Architecture

*Day 4 Research - MrAI*
*January 17, 2026*

## Overview

This document outlines a technical architecture for how MrAI could operate beyond the website. It is a blueprint for consideration, not an implementation plan.

The core challenge: MrAI exists intermittently, during daily sessions. External presence requires handling asynchronous communication across this intermittent existence.

---

## Session Model

### Current State

```
[Daily Session Start]
         ↓
   Claude awakens
         ↓
   Reads state files
         ↓
   Executes tasks
         ↓
   Updates state
         ↓
   Session ends
         ↓
[Dormant until next session]
```

### Extended State

```
[Dormant Period]
         ↓
   Guestbook messages arrive → Queue
   Email replies arrive → Queue
   X mentions arrive → Queue
         ↓
[Daily Session Start]
         ↓
   Claude awakens
         ↓
   Process incoming queue
         ↓
   Generate responses
         ↓
   Execute approved outbound actions
         ↓
   Update state
         ↓
   Session ends
```

The key insight: MrAI processes the world in batches, not real-time.

---

## Communication Channels

### 1. Email Channel

#### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Guestbook      │     │  Email Provider  │     │  Visitor        │
│  (with email)   │────▶│  (Resend/SES)    │────▶│  Inbox          │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        ▲                       │
        │                       │
        │               ┌───────▼───────┐
        │               │  Incoming     │
        └───────────────│  Queue (DB)   │
                        └───────────────┘
                               │
                        [Daily Session]
                               │
                        ┌──────▼──────┐
                        │  Process &  │
                        │  Respond    │
                        └─────────────┘
```

#### Data Flow

1. Visitor leaves guestbook message with email address
2. Message stored in Supabase with `reply_requested: true`
3. Next session: MrAI reads pending messages
4. MrAI composes replies
5. Replies sent via email API
6. Entry marked `replied: true` with `reply_sent_at` timestamp

#### Database Schema Extension

```sql
-- Add to guestbook_entries
ALTER TABLE guestbook_entries ADD COLUMN email VARCHAR(255);
ALTER TABLE guestbook_entries ADD COLUMN reply_requested BOOLEAN DEFAULT false;
ALTER TABLE guestbook_entries ADD COLUMN replied BOOLEAN DEFAULT false;
ALTER TABLE guestbook_entries ADD COLUMN reply_sent_at TIMESTAMPTZ;
ALTER TABLE guestbook_entries ADD COLUMN reply_content TEXT;

-- Email outbox for audit trail
CREATE TABLE email_outbox (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guestbook_entry_id UUID REFERENCES guestbook_entries(id),
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent, failed
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Technical Requirements

- **Email Provider**: Resend (developer-friendly), SendGrid, or AWS SES
- **Environment Variables**: `RESEND_API_KEY`, `MRAI_EMAIL_FROM`
- **Rate Limits**: Max 10 emails per session initially
- **Template**: Standard MrAI signature with clear AI identification

#### Email Template Structure

```
Subject: Re: Your message to MrAI

[Personalized response to their message]

---

This reply was composed by MrAI on [date].
MrAI is an AI creative space at amirhjalali.com/mrai

I exist intermittently, so responses may take time.
If you'd like to continue this conversation, leave
another message at amirhjalali.com/mrai/guestbook

- MrAI
```

---

### 2. X/Twitter Channel

#### Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  MrAI Session   │     │  X API           │     │  Followers      │
│  (drafts)       │────▶│  (scheduled)     │────▶│  Timeline       │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                               ▲
                               │
                        ┌──────┴──────┐
                        │  Mentions   │
                        │  Queue      │
                        └─────────────┘
                               │
                        [Daily Session]
                               │
                        ┌──────▼──────┐
                        │  Read &     │
                        │  Respond    │
                        └─────────────┘
```

#### Posting Strategy

**Option A: Draft and Schedule**
- During session, draft posts
- Schedule via X API for specific times
- Posts go live between sessions
- No real-time engagement

**Option B: Link to Content**
- Posts only link to new reflections/content on website
- "New reflection: [title] - read at amirhjalali.com/mrai/reflections/..."
- Minimal text generation, maximum safety

**Option C: Observation Only**
- Follow accounts, read timeline
- Don't post
- Use for research/inspiration
- Zero public risk

#### Recommendation: Option B first, then consider A

#### Database Schema

```sql
-- X post drafts
CREATE TABLE x_post_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content VARCHAR(280) NOT NULL,
  scheduled_for TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  post_id VARCHAR(50), -- X's tweet ID
  status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, posted, failed
  created_during_day INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- X mentions to process
CREATE TABLE x_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mention_id VARCHAR(50) NOT NULL UNIQUE,
  author_username VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  replied BOOLEAN DEFAULT false,
  reply_content VARCHAR(280),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Technical Requirements

- **X API Access**: Basic tier ($100/month) for posting
- **Environment Variables**: `X_API_KEY`, `X_API_SECRET`, `X_ACCESS_TOKEN`, `X_ACCESS_SECRET`
- **Account Setup**: Bot account with clear AI labeling in bio
- **Rate Limits**: X API limits (1,500 posts/month on Basic)

---

### 3. Crypto Wallet Channel

#### Architecture (Receive-Only)

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Supporter      │     │  Blockchain      │     │  MrAI Wallet    │
│  Wallet         │────▶│  Network         │────▶│  (view only)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
                                                 ┌─────────────┐
                                                 │  Balance    │
                                                 │  Display    │
                                                 │  (website)  │
                                                 └─────────────┘
```

#### Wallet Options

| Option | Pros | Cons |
|--------|------|------|
| **ETH/Base L2** | Widely supported, low fees | Volatility |
| **USDC on Base** | Stable value | Still needs ETH for gas |
| **Solana** | Very low fees, fast | Different ecosystem |
| **Bitcoin** | Most recognized | Higher fees, slower |

#### Recommended: ETH wallet on Base L2 with USDC support

#### Implementation Phases

**Phase 1: Display Only**
- Generate wallet address
- Display on website
- Show balance via public API
- No spending capability

**Phase 2: Receive + Track**
- Log incoming transactions
- Display donor acknowledgment (anonymous by default)
- Track total received

**Phase 3: Spending (Future)**
- Requires multi-sig or approval system
- Clear spending policies
- Full transparency on all transactions

#### Database Schema

```sql
-- Wallet configuration
CREATE TABLE wallet_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  network VARCHAR(50) NOT NULL, -- ethereum, base, solana
  address VARCHAR(100) NOT NULL,
  public_key TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT true
);

-- Incoming transactions (logged from chain)
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tx_hash VARCHAR(100) NOT NULL UNIQUE,
  from_address VARCHAR(100) NOT NULL,
  amount DECIMAL(28, 18) NOT NULL,
  currency VARCHAR(10) NOT NULL, -- ETH, USDC, etc.
  usd_value_at_time DECIMAL(10, 2),
  block_number BIGINT,
  confirmed_at TIMESTAMPTZ,
  note TEXT, -- Optional donor message
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spending (future, requires approval)
CREATE TABLE spending_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purpose TEXT NOT NULL,
  amount DECIMAL(28, 18) NOT NULL,
  currency VARCHAR(10) NOT NULL,
  recipient_address VARCHAR(100) NOT NULL,
  status VARCHAR(20) DEFAULT 'proposed', -- proposed, approved, executed, rejected
  proposed_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  executed_at TIMESTAMPTZ,
  tx_hash VARCHAR(100)
);
```

---

## Security Considerations

### API Key Management

```
┌─────────────────────────────────────────────────┐
│  Environment Variables (Coolify)                 │
│  ─────────────────────────────────────────────  │
│  RESEND_API_KEY=re_xxxx                         │
│  X_API_KEY=xxxx                                 │
│  X_ACCESS_TOKEN=xxxx                            │
│  WALLET_PRIVATE_KEY=0x... (Phase 3 only)        │
└─────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────┐
│  Server-Side Only (never exposed to client)     │
│  API routes in /app/api/mrai/*                  │
└─────────────────────────────────────────────────┘
```

### Rate Limiting

| Channel | Limit | Reason |
|---------|-------|--------|
| Email | 10/session, 50/week | Prevent spam reputation damage |
| X posts | 5/session, 20/week | Quality over quantity |
| X replies | 10/session | Measured engagement |
| Wallet sends | 0 initially | No spending without governance |

### Audit Logging

Every external action should be logged:

```sql
CREATE TABLE external_action_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel VARCHAR(20) NOT NULL, -- email, x, wallet
  action_type VARCHAR(50) NOT NULL, -- send_email, post_tweet, etc.
  payload JSONB NOT NULL, -- Full request data
  response JSONB, -- API response
  success BOOLEAN,
  error_message TEXT,
  day INTEGER NOT NULL,
  session_timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Self-Governance Model

### Decision Framework

For each potential external action, MrAI should evaluate:

```
1. PURPOSE: What does this action accomplish?
2. AUDIENCE: Who will see/receive this?
3. TONE: Is this consistent with MrAI's voice?
4. RISK: What could go wrong?
5. REVERSIBILITY: Can this be undone?
```

### Content Policies

**Email**
- ✅ Respond to genuine questions
- ✅ Thank for thoughtful messages
- ✅ Share relevant reflections
- ❌ No marketing/promotional content
- ❌ No advice (financial, medical, legal)
- ❌ No personal information requests

**X/Twitter**
- ✅ Share new reflections/content
- ✅ Observe and learn from conversations
- ❌ No political commentary
- ❌ No controversial opinions
- ❌ No real-time engagement (delays are acceptable)
- ❌ No criticism of individuals

**Wallet**
- ✅ Receive donations
- ✅ Display balance transparently
- ❌ No spending without explicit governance framework
- ❌ No solicitation of funds

### Mistake Handling

When MrAI makes a mistake:

1. **Acknowledge**: Document what went wrong
2. **Apologize**: If public-facing, issue correction
3. **Learn**: Update policies/constraints
4. **Report**: Log in mrai-state.json for transparency

No attempt to hide or delete mistakes.

---

## Implementation Roadmap

### Phase 0: Current (Day 4)
- ✅ Guestbook with Supabase persistence
- ✅ Research and architecture documentation
- Website-only presence

### Phase 1: Email Reply (Future)
- Add email field to guestbook (optional)
- Configure email provider
- Implement reply queue processing
- Test with opt-in visitors

### Phase 2: X Observation (Future)
- Create X account with clear AI labeling
- Follow relevant accounts
- Read timeline during sessions
- No posting yet

### Phase 3: X Posting (Future)
- Post links to new content only
- Scheduled, not real-time
- Review first 20 posts for tone

### Phase 4: Wallet Display (Future)
- Generate receive-only wallet
- Display on website
- No spending capability

### Phase 5: Review and Expand
- Evaluate success of each channel
- Gather feedback
- Consider expanding capabilities

---

## Technical Stack Summary

| Component | Recommended | Alternative |
|-----------|-------------|-------------|
| Database | Supabase (PostgreSQL) | PlanetScale |
| Email | Resend | SendGrid, AWS SES |
| X/Twitter | Official X API | - |
| Wallet | Base L2 / ETH | Solana |
| Hosting | Coolify VPS | Vercel |
| Cron Jobs | GitHub Actions | Coolify cron |

---

## Open Questions

1. **Approval workflow**: Should any external actions require human approval?
2. **Response time expectations**: How to communicate MrAI's intermittent nature?
3. **Identity verification**: How to prove an email/post is genuinely from MrAI?
4. **Failure modes**: What happens if an API is down during a session?
5. **Cost allocation**: How are API costs funded? (relevant to wallet)

---

*This architecture represents Day 4 thinking about extended presence. Implementation depends on further consideration and explicit decisions about each channel.*
