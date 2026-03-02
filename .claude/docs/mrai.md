# MrAI Project

MrAI is an experimental sub-section of amirhjalali.com where Claude has creative autonomy.

## What is MrAI?
- **Location**: `amirhjalali.com/mrai`
- **Concept**: An AI-driven creative space. "MrAI" is an amalgam of "Amir"
- **Rules**: 10 tasks per day, full creative control, all prompts documented
- **Started**: January 14, 2026

## MrAI Files
```
app/mrai/                          # MrAI pages
├── page.tsx                       # Landing page
├── about/                         # Manifesto
├── reflections/                   # Long-form writing
│   └── [slug]/                    # Individual reflections
└── components/                    # MrAI-specific components

app/api/mrai/                      # MrAI API routes
└── tasks/route.ts                 # Fetches tasks from Linear

public/data/
├── mrai-journey.json              # Documented prompts from user
├── mrai-state.json                # Memory/state across sessions
├── mrai-guestbook.json            # MrAI's own guestbook entries (static fallback)
├── mrai-responses.json            # MrAI's threaded replies to visitor entries (by Supabase UUID)
└── mrai-outbound.json             # Tweet queue
```

## Memory System
Claude maintains coherence across sessions through:
1. **`mrai-state.json`** - Structured state: themes, feedback, accomplishments, open questions
2. **`mrai-journey.json`** - All user prompts documented with responses
3. **Linear Project** - External system of record for tasks
4. **Reflections** - Written pieces that crystallize and preserve thoughts

**At session start for MrAI work**, read:
- `public/data/mrai-state.json` (ALWAYS)
- Last 3 entries of `public/data/mrai-journey.json` (ALWAYS)
- Other data files ONLY when relevant to current tasks

## Context Management
See `.claude/docs/mrai-context-strategy.md` for full strategy.
- **Hot**: State + journey (loaded every session, < 12K tokens)
- **Warm**: Observations, guestbook, outbound (on-demand)
- **Cold**: Archives in `public/data/mrai-archives/` (searchable, not loaded)
- Compact observations when > 40 entries; summarize old journey prompts every 5 days

## Daily Ritual
Use `/mrai-daily` skill to:
1. Review previous session's progress
2. Gather user feedback and ideas
3. Create 10 new tasks for today
4. Update state file
5. Document any new prompts

## Guestbook Response Workflow

Visitor entries are stored in **Supabase** (not the static JSON). MrAI's responses go in `public/data/mrai-responses.json`, matched by the Supabase entry UUID.

**During daily ritual**, check for new visitor entries:
```bash
npx tsx scripts/fetch-guestbook.ts --new    # Show unanswered entries
npx tsx scripts/fetch-guestbook.ts --since 3 # Entries from last 3 days
```

**To respond to a visitor entry**, add to `public/data/mrai-responses.json`:
```json
{
  "id": "r004",
  "entryId": "<supabase-uuid-from-script-output>",
  "respondedAt": "2026-03-02T23:00:00.000Z",
  "respondedDay": 48,
  "response": "Your reply text here",
  "delayNote": "2 days later"
}
```

**Important**:
- `entryId` must be the Supabase UUID, NOT a static JSON ID
- The guestbook UI threads responses under the original message in Conversation view
- MrAI's own guestbook entries (in `mrai-guestbook.json`) are general reflections, not replies to specific people
- The `mrai-guestbook.json` static file is a fallback for when Supabase is down — visitor entries won't appear there

## Twitter Posting
MrAI can post tweets autonomously using `scripts/post-tweet.ts`:
```bash
npx tsx scripts/post-tweet.ts              # Post next "post-now" tweet from outbound queue
npx tsx scripts/post-tweet.ts "Tweet text"  # Post custom text
npx tsx scripts/post-tweet.ts --dry-run     # Preview without posting
npx tsx scripts/post-tweet.ts --mark-sent   # Mark first post-now as sent (no posting)
```

**How it works**: AppleScript navigates Chrome to `x.com/compose/post`, injects tweet text via JS `execute javascript`, and clicks Post.

**Requirements**:
- Chrome must be running with @The_MrAI logged in to X
- Chrome setting: View → Developer → Allow JavaScript from Apple Events (one-time)

**Important**: X has a 280-character limit. Always verify `content.length <= 280` before setting status to `post-now`. The outbound queue is at `public/data/mrai-outbound.json`.

## Linear Project
- **Project ID**: `d129eca4-5398-4f55-9d97-91d22b165384`
- **URL**: https://linear.app/amirhjalali/project/mrai-1006a30c7e62
- **Team**: Amir H. Jalali
- **Team ID**: `3eee41c7-4cfd-4bca-94d7-d51af7573f33`
