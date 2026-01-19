# Notes Enrichment System Design

**Date:** 2026-01-19
**Status:** Approved, implementing

## Overview

Enhance the notes system to automatically extract rich metadata from saved links using platform-specific extractors, with a pattern learning system for unknown domains.

## Goals

1. Extract comprehensive data from all major platforms (X, YouTube, LinkedIn, Reddit, Medium/Substack, GitHub, news sites)
2. Background processing - quick save, async extraction
3. Rich compact cards with expandable detail sections
4. Self-improving: learn extraction patterns for frequently-saved domains

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Quick Save Layer                   │
│  URL → Basic metadata (title, domain) → Save to DB  │
│                    (~1 second)                       │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│               Background Extraction Queue            │
│  Platform Router → Specific Extractor → Full data   │
│                   (5-30 seconds)                     │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                Pattern Learning System               │
│  Track domain frequency → Analyze structure →       │
│  Generate reusable extraction config                │
└─────────────────────────────────────────────────────┘
```

**Processing states:** `PENDING` → `EXTRACTING` → `ANALYZING` → `INDEXED`

## Platform Extractors

| Platform | Method | Data Retrieved |
|----------|--------|----------------|
| X/Twitter | Embedded tweet API + scraping | Tweet text, author, avatar, media, engagement counts, thread detection |
| YouTube | oEmbed + transcript API | Title, channel, thumbnail, description, duration, transcript, views |
| LinkedIn | OG tags + scraping | Post text, author info, engagement, images |
| Reddit | JSON API (.json suffix) | Post content, author, subreddit, score, comments, awards |
| Medium/Substack | Readability + OG | Full article, author, publication, engagement, reading time |
| GitHub | GitHub API | Repo/issue/PR details, author, stars, language, README |
| News sites | Readability + schema.org | Article text, author, date, images, related |
| Generic | OG + Readability + screenshot | Whatever available + visual capture |

## Data Model Extensions

```typescript
interface EnrichedNote extends Note {
  // Author info
  authorName?: string
  authorHandle?: string
  authorAvatar?: string
  authorBio?: string

  // Visual
  thumbnailUrl?: string
  screenshotUrl?: string

  // Engagement (platform-specific)
  engagement?: {
    likes?: number
    shares?: number
    comments?: number
    views?: number
    [key: string]: number | undefined
  }

  // Media
  mediaItems?: Array<{
    type: 'image' | 'video' | 'gif'
    url: string
    thumbnailUrl?: string
    alt?: string
  }>

  // Links
  mentionedLinks?: Array<{
    url: string
    title?: string
    domain?: string
  }>

  // Personal
  userNotes?: string

  // Extraction metadata
  extractorUsed?: string
  extractedAt?: string
  extractionVersion?: string
}
```

## UI Components

### Compact Card (Default View)

Shows at a glance:
- Thumbnail (left side, ~80px)
- Title + Source domain
- Author avatar + name/handle
- One-line excerpt (~100 chars)
- Tags (max 3)
- Type badge + Status badge
- Relative date

### Expandable Sections

Click to expand:
1. **Full Content** - Complete post/article text
2. **AI Summary** - Generated summary + key insights
3. **Your Notes** - Personal annotations (editable)
4. **Media Gallery** - All images/videos
5. **Metadata** - Word count, reading time, engagement stats
6. **Related Links** - Links from post + related notes
7. **Source Info** - Full author bio, platform details

## Pattern Learning System

**Triggers:** Domain appears 3+ times in saved notes

**Process:**
1. Collect successful extractions for domain
2. Analyze DOM patterns across samples
3. Generate CSS selectors for: title, author, content, date, images
4. Store as `DomainPattern` config
5. Use pattern for future extractions from same domain

```typescript
interface DomainPattern {
  domain: string
  version: number
  createdAt: string
  updatedAt: string
  sampleCount: number
  selectors: {
    title?: string
    author?: string
    authorAvatar?: string
    content?: string
    date?: string
    images?: string
    engagement?: Record<string, string>
  }
  confidence: number // 0-1 based on extraction success rate
}
```

## Implementation Order

1. Update types (`lib/types.ts`)
2. Create extractor base interface (`lib/extractors/base.ts`)
3. Implement platform extractors (one at a time)
4. Build platform router
5. Update processing queue
6. Build new card components
7. Implement pattern learning
8. Test & deploy

## Files to Create/Modify

**New files:**
- `lib/extractors/base.ts` - Base extractor interface
- `lib/extractors/twitter.ts`
- `lib/extractors/youtube.ts`
- `lib/extractors/reddit.ts`
- `lib/extractors/linkedin.ts`
- `lib/extractors/medium.ts`
- `lib/extractors/github.ts`
- `lib/extractors/generic.ts`
- `lib/extractors/router.ts` - Platform detection & routing
- `lib/extractors/pattern-learner.ts`
- `app/notes/components/EnrichedNoteCard.tsx`
- `app/notes/components/ExpandableSection.tsx`

**Modified files:**
- `lib/types.ts` - Add enrichment fields
- `lib/note-processing-service.ts` - Integrate new extractors
- `app/notes/[id]/NoteDetailClient.tsx` - Add expandable sections
- `app/notes/components/NoteCard.tsx` - Update compact view
