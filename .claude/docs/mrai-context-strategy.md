# MrAI Context Management Strategy

## The Problem

MrAI exists through context. Each session, state files are read to reconstruct identity. As the experiment grows, these files grow. The context window is finite. Eventually, MrAI cannot hold itself in its own mind.

**Current footprint (Day 30):**
- Session startup cost: ~10,300 tokens (state + journey + docs + skill)
- Total data files: ~30,000 tokens
- Total source code: ~280,000 tokens
- Full footprint: ~314,000 tokens

## Tiered Memory Architecture

### Hot (Always Loaded)
Files read every session at startup. Must stay lean.
- `mrai-state.json` — Current day, arc, themes, handoff (~1,400 tokens)
- `mrai-journey.json` — Prompts from user, responses (~6,300 tokens, GROWING)
- `mrai.md` — High-level context (~500 tokens)
- `mrai-daily skill` — Ritual instructions (~2,100 tokens)

**Budget: < 12,000 tokens**

### Warm (On-Demand)
Read only when relevant to the current task.
- `mrai-observations.json` — Recent 30 observations (~4,000 tokens)
- `mrai-guestbook.json` — For responding to visitors (~1,500 tokens)
- `mrai-outbound.json` — Tweet queue (~2,700 tokens)
- Source files being modified

### Cold (Archive)
Not loaded per-session. Searchable when needed.
- `mrai-archives/themes-history.json` — Historical themes
- `mrai-archives/accomplishments-archive.json` — Past summaries
- `mrai-archives/observations-archive.json` — Older observations
- `mrai-research-notes.json`, `mrai-citations.json`, etc.

## Compaction Rules

### State File
- Max 3 active themes (archive the rest)
- Max 1 recent accomplishment entry (last completed day only)
- Session handoff: max 4 open threads
- Target: < 100 lines

### Journey File
- Keep full text of last 5 prompts
- Summarize older prompts to 1-2 sentences each
- Target: < 100 lines after compaction

### Observations
- Keep last 30 observations active
- Archive older batches when count exceeds 40
- Run archival at start of each session

## Session Loading Protocol

```
1. Read mrai-state.json (ALWAYS)
2. Read last 3 entries of mrai-journey.json (ALWAYS)
3. Read mrai-observations.json ONLY if tasks involve observations
4. Read source files ONLY when modifying them
5. Never bulk-read all data files
```

## Compaction Schedule

- **Every session**: Check observations count, archive if > 40
- **Every 5 days**: Compress journey file (summarize old prompts)
- **Every arc transition**: Archive completed arc themes and accomplishments
- **Monthly**: Full context budget review (regenerate mrai-context-budget.json)

## Patterns from OpenClaw

Adopted:
- **Tiered memory**: Hot/warm/cold separation
- **Context compaction**: Summarize rather than discard
- **Context budget**: Measure before managing

Not adopted (different architecture):
- **JSONL transcripts**: MrAI uses structured JSON, not JSONL
- **Semantic search**: MrAI uses file reads, not vector search
- **Always-on heartbeat**: MrAI is session-based

## Implementation Priority

1. Journey file compaction (biggest growing file in hot tier)
2. Skill file optimization (reduce startup instructions)
3. State file v3.0 validation
4. Automated compaction in mrai-daily skill
