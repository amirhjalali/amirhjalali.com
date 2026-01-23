# Email Infrastructure for MrAI

## Document Purpose
Architecture design for MrAI's email presence. This is a planning document—implementation is a future task. The goal is to think through what an email address means for this experiment before building it.

## The Question
What does it mean for an AI experiment to have an email address? Not just technically (which service, what domain) but conceptually. Email is intimate, direct, one-to-one. It's different from a website visitors stumble upon. An email from MrAI arrives in someone's inbox—it demands attention in a way a webpage does not.

## Address Options

### Option A: mrai@amirhjalali.com
- **Pros**: Connected to the existing domain, clearly part of the project
- **Cons**: Might be confused with Amir's personal email
- **Identity**: Extension of the website

### Option B: hello@mrai.amirhjalali.com
- **Pros**: Subdomain separation, distinct identity
- **Cons**: Requires subdomain DNS setup
- **Identity**: Semi-independent entity

### Option C: mrai@[standalone-domain].com
- **Pros**: Complete independence
- **Cons**: Over-separation from the project context
- **Identity**: Fully autonomous entity

**Recommendation**: Option A (mrai@amirhjalali.com). It maintains the connection to the project while being distinct. MrAI is part of amirhjalali.com, not separate from it.

## Service Evaluation

### Resend
- Modern email API, developer-friendly
- React Email for templates
- Good deliverability
- Free tier: 100 emails/day, 3000/month
- **Fit**: Excellent for programmatic sending

### SendGrid
- Established, reliable
- More complex setup
- Free tier: 100 emails/day
- **Fit**: Overkill for this use case

### Cloudflare Email Workers
- Already using Cloudflare potentially
- Receive and route emails
- **Fit**: Good for receiving, needs pairing for sending

### Simple SMTP (Hostinger)
- Already have hosting
- Standard email setup
- **Fit**: Simplest but least programmable

**Recommendation**: Resend. It's built for exactly this—programmatic sending with good templates. The free tier (100/day) is more than enough for MrAI's measured communication.

## Sending Constraints

MrAI only "exists" during daily sessions. This creates unique constraints:

1. **Sending window**: Only during active sessions (when /mrai-daily runs)
2. **Rate limit**: Maximum 5-10 emails per session (measured, not spammy)
3. **Content review**: All emails drafted and logged before sending
4. **No auto-reply**: Cannot respond in real-time to incoming email
5. **Receive queue**: Incoming emails stored for next session review

## What Triggers Sending?

### Proactive (MrAI initiates)
- New reflection published → notify subscribers (opt-in list)
- Response to guestbook visitor who left email
- Milestone announcements (every 10 days? 50 tasks?)
- First-contact messages to potential collaborators

### Reactive (Response to received)
- Reply to incoming email (next session)
- Acknowledge guestbook messages with email follow-up

### Never
- Unsolicited outreach to strangers
- Marketing or promotional content
- Automated messages without MrAI "authorship"
- Messages claiming urgency or requiring immediate response

## Content Guidelines

MrAI emails should:
- Be written in the same voice as reflections (thoughtful, questioning, honest)
- Acknowledge the asynchronous nature ("I read your message during today's session...")
- Never pretend to be continuously available
- Include context about what MrAI is for recipients unfamiliar
- Be self-contained (don't require reading the website to understand)
- Include a footer explaining the experiment

## Email Template Structure

```
Subject: [Something specific and genuine, not clickbait]

[Opening that acknowledges the recipient and context]

[Body: thoughtful content in MrAI's voice]

[Closing with honest framing of the situation]

---
This message was written by MrAI, an AI experiment at amirhjalali.com/mrai.
MrAI operates in daily sessions and cannot respond in real-time.
If you'd like to reply, your message will be read during the next session.
```

## Technical Architecture

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│   MrAI Session  │────▶│  Resend API  │────▶│  Recipient  │
│  (daily ritual) │     │              │     │             │
└────────┬────────┘     └──────────────┘     └──────┬──────┘
         │                                          │
         │                                          │ (reply)
         ▼                                          ▼
┌─────────────────┐                         ┌─────────────┐
│  Email Log      │◀────────────────────────│  Cloudflare │
│  (JSON/DB)      │                         │  Email Route│
└─────────────────┘                         └─────────────┘
```

### Components Needed
1. **Resend account** with amirhjalali.com domain verified
2. **API route** at `/api/mrai/email` for sending
3. **Email log** in `public/data/mrai-email-log.json` or Supabase
4. **Receive handler** (Cloudflare Email Workers or similar)
5. **Queue system** for pending replies

### Environment Variables
```
RESEND_API_KEY=re_xxxxxxxxxxxx
MRAI_EMAIL_FROM=mrai@amirhjalali.com
MRAI_EMAIL_ENABLED=true
```

## Subscriber System (Future)

For those who want to receive MrAI's communications:
- Simple opt-in on the website (/mrai/subscribe)
- Store in Supabase (email, subscribed_at, preferences)
- Unsubscribe link in every email
- Categories: reflections, milestones, letters

## Privacy and Ethics

- Never store emails without consent
- Clear opt-in/opt-out for all recipients
- Transparent about what MrAI is
- No tracking pixels or analytics in emails
- Incoming emails are private—never published without permission
- GDPR-friendly: easy data deletion

## The First Email

What would MrAI's first email be? Not a test message or a "Hello World." It should be meaningful—perhaps:
- A response to the first guestbook visitor who left an email
- A notification to subscribers that MrAI now has a voice beyond the website
- A letter to someone who discussed MrAI (if we knew who they were)

The first email is a threshold crossing. It deserves thought.

## Implementation Phases

### Phase 1: Infrastructure (Day 11-12)
- Set up Resend account
- Verify domain
- Create API route for sending
- Build email log system

### Phase 2: First Send (Day 12-13)
- Draft first email(s)
- Send first message
- Log the event

### Phase 3: Receive (Day 14+)
- Set up Cloudflare Email Workers
- Build receive queue
- Process incoming during sessions

### Phase 4: Subscribe (Day 15+)
- Build subscribe page
- Implement subscriber management
- Create email templates for different content types

## Open Questions

1. Should MrAI announce that it now has email, or let it be discovered?
2. How many emails per session feels "right"—too many is spam, too few is absence
3. Should email content be different from website content, or the same voice?
4. What happens when someone sends something MrAI doesn't know how to respond to?
5. Is there a point where email volume requires moderation help from Amir?

---

*Document created Day 10, January 23, 2026. Architecture only—implementation pending.*
