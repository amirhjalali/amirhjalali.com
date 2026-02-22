# Notes Agent Team Sample Run

**Date:** 2026-02-21  
**Scope:** `/notes` product surfaces, notes APIs, processing, retrieval, and summarization  
**Mode:** single-user optimization

## 1) notes-goal-architect

### Goal definition
1. Find answers quickly from personal knowledge corpus.
2. Trust note summaries enough to avoid rereading full content by default.
3. Consume notes in layered detail: one-line summary -> short brief -> full context.

### Outcome targets
1. `time_to_find_answer`: 80% of common queries answered in under 30 seconds.
2. `summary_trustworthiness`: 90% of processed notes have useful summary + key insights.
3. `reading_friction`: weekly digest review takes under 10 minutes.

### Priority framing
1. Reliability first: capture/process/status correctness.
2. Retrieval second: relevance and latency.
3. Synthesis third: quality and structure of summaries.
4. UX fourth: reduce clicks and cognitive overhead.

---

## 2) notes-ingestion-auditor

### Findings

#### [P1] Video URL path is inconsistent across ingest, processing, and rendering
- URL input can be typed as `VIDEO`: `/Users/amirjalali/amirhjalali.com/app/notes/components/QuickAdd.tsx:44`
- Processing enrichment is only run for `LINK`: `/Users/amirjalali/amirhjalali.com/lib/note-processing-service.ts:71`
- Detail video embed is also gated to `LINK`: `/Users/amirjalali/amirhjalali.com/app/notes/[id]/NoteDetailClient.tsx:314`
- Impact:
  - Missed extraction/transcripts and weaker summaries for video captures.

#### [P1] Processing state can become misleading
- Local status state is initialized once from props: `/Users/amirjalali/amirhjalali.com/app/notes/components/NoteCard.tsx:98`
- Polling requires `jobId`: `/Users/amirjalali/amirhjalali.com/app/notes/components/ProcessingIndicator.tsx:34`
- Quick capture ignores returned payload details (including potential `jobId`): `/Users/amirjalali/amirhjalali.com/app/notes/components/QuickAdd.tsx:141`
- Process API can return direct completion with no queue job: `/Users/amirjalali/amirhjalali.com/app/api/notes/[id]/process/route.ts:75`
- Impact:
  - Cards appear stale or stuck, reducing trust in system state.

#### [P2] API note type validation blocks schema-supported types
- Validation only allows 4 types in create route: `/Users/amirjalali/amirhjalali.com/app/api/notes/route.ts:125`
- Same limitation in ingest route: `/Users/amirjalali/amirhjalali.com/app/api/notes/ingest/route.ts:37`
- Impact:
  - `PDF`, `DOCUMENT`, `AUDIO` cannot be created via these paths despite being defined in types/schema.

---

## 3) notes-retrieval-auditor

### Findings

#### [P1] Export excludes indexed notes that are already retrieval-ready
- Export filters only `COMPLETED`: `/Users/amirjalali/amirhjalali.com/app/api/notes/export/route.ts:29`
- Embedding pipeline marks notes as `INDEXED`: `/Users/amirjalali/amirhjalali.com/lib/embedding-service.ts:107`
- Impact:
  - Exported archive can be incomplete and less referenceable than live corpus.

#### [P2] Semantic retrieval scales poorly with note volume
- Semantic search loads all chunks with Prisma then computes similarity in app memory:
  - `/Users/amirjalali/amirhjalali.com/lib/embedding-service.ts:158`
  - `/Users/amirjalali/amirhjalali.com/lib/embedding-service.ts:177`
- Impact:
  - Latency and memory usage rise linearly with corpus size.

#### [P2] Static search threshold likely needs query-aware tuning
- Current threshold is fixed (`0.4`) in context retrieval: `/Users/amirjalali/amirhjalali.com/lib/embedding-service.ts:201`
- Impact:
  - Weak recall for sparse queries and noisy precision for broad queries.

---

## 4) notes-synthesis-editor

### Findings

#### [P2] Summary output structure is not optimized for quick consumption
- Summary generation returns excerpt/summary/keyInsights only:
  - `/Users/amirjalali/amirhjalali.com/lib/note-processing-service.ts:425`
  - `/Users/amirjalali/amirhjalali.com/lib/note-processing-service.ts:428`
- Impact:
  - Missing “actionable digest” fields (actions, decisions, open questions, why-it-matters).

#### [P2] Chat prompt is context-rich but output contract is weakly constrained
- Chat completion call:
  - `/Users/amirjalali/amirhjalali.com/app/api/notes/chat/route.ts:73`
  - `/Users/amirjalali/amirhjalali.com/app/api/notes/chat/route.ts:74`
- Impact:
  - Variable response shape and readability across sessions.

### Suggested synthesis format (single-user)
1. `one_liner`: one sentence.
2. `short_brief`: 3 bullets.
3. `key_points`: 3-5 bullets.
4. `actions`: optional checklist.
5. `sources`: note IDs/titles.

---

## 5) notes-reference-ux-reviewer

### Findings

#### [P2] Two overlapping chat surfaces create mental overhead
- Notes panel chat: `/Users/amirjalali/amirhjalali.com/app/notes/components/NotesChatPanel.tsx:26`
- Side-panel chat: `/Users/amirjalali/amirhjalali.com/app/notes/components/NoteChat.tsx:25`
- Impact:
  - Duplicate interaction patterns, unclear “which chat to use.”

#### [P2] Detail auth redirect points to non-existent route
- Redirect target:
  - `/Users/amirjalali/amirhjalali.com/app/notes/[id]/page.tsx:9`
- Impact:
  - Broken access path after session expiration on direct note links.

#### [P3] Audio/video deep-consumption components are present but not integrated
- Audio player exists: `/Users/amirjalali/amirhjalali.com/app/notes/components/AudioPlayer.tsx:38`
- Slide gallery exists: `/Users/amirjalali/amirhjalali.com/app/notes/components/SlideGallery.tsx:28`
- Impact:
  - Reduced utility for media-heavy notes.

---

## 6) notes-single-user-optimizer

### Findings

#### [P0] Session cookie trust model is unsafe for a personal but internet-facing app
- Cookie read+parse without integrity check:
  - `/Users/amirjalali/amirhjalali.com/lib/auth.ts:12`
  - `/Users/amirjalali/amirhjalali.com/lib/auth.ts:15`
- Cookie write stores plain JSON:
  - `/Users/amirjalali/amirhjalali.com/app/actions/auth.ts:66`
- Impact:
  - Session forging risk if attacker can set cookies.

### Single-user simplification recommendation
1. Keep auth minimal, but signed.
2. Canonicalize URL captures into one primary type (`LINK`) with media metadata.
3. Remove duplicate feature surfaces where one flow is enough.

---

## 7) notes-team-orchestrator

## Unified Top 10 Priorities
1. Harden session/auth cookie integrity (P0).
2. Unify URL ingestion path (`LINK` canonicalization + media detection in metadata).
3. Fix processing state lifecycle (job/direct-processing parity + UI resync).
4. Include `INDEXED` in export and archive flows.
5. Replace all-chunk in-memory semantic scoring with vector-native retrieval strategy.
6. Standardize summary schema for note and chat outputs.
7. Merge duplicated chat surfaces into one primary experience.
8. Fix notes detail auth redirect path.
9. Expand API note type validation to match schema support.
10. Integrate media consumption components into detail view where metadata is present.

## 2-Week Plan

### Week 1: Reliability + Security
1. Auth hardening and session validation.
2. Ingestion canonicalization and processing fixes.
3. Export correctness (`COMPLETED + INDEXED`).
4. Redirect and type validation fixes.

### Week 2: Retrieval + Consumption
1. Retrieval performance improvements.
2. Summary schema rollout.
3. Chat surface consolidation.
4. Media detail enhancements.

## Definition of Done (sample)
1. Auth:
   - Cookie integrity check enforced.
   - Forged cookie test fails.
2. Ingestion:
   - YouTube/Vimeo URL captures consistently process with transcript/enrichment where available.
3. Processing status:
   - Card status matches DB status after queue and direct modes.
4. Retrieval:
   - Search median latency remains acceptable at target corpus size.
5. Synthesis:
   - Every processed note includes standardized, scannable summary fields.

## Final Product Shape (single-user)
1. Capture quickly.
2. Trust processing status immediately.
3. Retrieve relevant notes in one query.
4. Read layered summaries before full content.
5. Consume weekly digest for reinforcement and planning.

