# Notes App vs Recall AI - Feature Comparison

## Executive Summary

This document compares our current Notes functionality with [Recall AI](https://www.getrecall.ai/), a popular knowledge management tool. The goal is to identify gaps and opportunities to make our notes system more powerful and user-friendly.

**Key Takeaway:** Recall focuses on being a "personal AI encyclopedia" with rich media preservation, visual knowledge graphs, and active learning features. Our system has strong AI processing but lacks media preservation, visual organization, and retention features.

---

## Side-by-Side Feature Comparison

| Feature | Our Notes | Recall AI | Gap |
|---------|-----------|-----------|-----|
| **Content Types** | Links, Text, Images, Video, PDF, Document | Articles, YouTube, Podcasts, PDFs, Google Docs, TikTok, Recipes, Personal Notes | Similar coverage |
| **AI Summarization** | GPT-4o-mini excerpt + summary | One-click summaries (concise or detailed) | Similar |
| **Topic Extraction** | Auto-extracted topics (3-10) | Auto-tags based on content + existing tags | Similar |
| **Semantic Search** | Vector embeddings + cosine similarity | Full-text + semantic search | Similar |
| **Chat with Notes** | RAG-based chat over notes | Chat scoped to specific content | Similar |
| **Image Preservation** | Uploaded to R2, but UI doesn't display well | Full media preservation in summaries | **GAP** |
| **Video Handling** | Extracts metadata only, no transcript | Full video summarization (up to 10 hrs) | **MAJOR GAP** |
| **Knowledge Graph** | None - flat list | Visual graph database with auto-connections | **MAJOR GAP** |
| **Spaced Repetition** | None | Built-in review system with quizzes | **MAJOR GAP** |
| **Augmented Browsing** | None | Real-time content resurfacing while browsing | **MAJOR GAP** |
| **Browser Extension** | None | Chrome + Firefox extensions | **MAJOR GAP** |
| **Mobile App** | Responsive web only | Native iOS + Android (beta) | **GAP** |
| **Manual Linking** | None | "/" commands and highlight linking | **GAP** |
| **Block Editor** | None | Rich block-style notebook editor | **GAP** |
| **Export** | None | Markdown export | **GAP** |

---

## Detailed Analysis

### 1. Content Capture & Preservation

#### Our System
```
Link → Fetch HTML → Readability extraction → Text only
Image → Upload to R2 → URL stored (not displayed in UI)
Video → Extract metadata (ID, thumbnail, embed URL) → No transcript
```

**Problem:** We strip rich content down to plain text. The original context (images, videos, formatting) is lost in the user experience.

#### Recall
```
Link → Full page preserved with formatting
YouTube → Transcript + AI summary + playable embed
Image → Preserved inline with content
PDF → Full document with page-by-page access
```

**Advantage:** Users see the original content alongside AI summaries. Nothing is "lost."

---

### 2. Visual Organization

#### Our System
- Flat list view (grid or list)
- Filter by type, status, tags
- No visual connections between related notes
- No graph visualization

#### Recall
- **Knowledge Graph:** Visual map showing connections between ideas
- **Auto-linking:** Related content automatically connected via keywords
- **Manual linking:** Users can create explicit connections
- Topics form nodes, content forms connections

**Impact:** Users can't discover relationships between their saved content in our system.

---

### 3. Media Handling

#### Our System - Images
```typescript
// Current flow:
1. Image uploaded → Base64 → R2 storage → URL saved
2. UI displays: Just the URL or a small thumbnail
3. Original image context: Lost
```

#### Our System - Videos
```typescript
// Current flow:
1. YouTube URL → Extract videoId, thumbnail, title
2. No transcript extraction
3. No video summarization
4. User must watch video to get content
```

#### Recall - Videos
```
1. YouTube URL → Full transcript extracted
2. AI summary generated from transcript
3. Playable embed preserved
4. Timestamps linked to content
5. Supports up to 10-hour videos
```

**Gap:** We're not extracting the actual content from videos - just metadata.

---

### 4. Learning & Retention

#### Our System
- Notes are saved and searchable
- No active recall features
- No spaced repetition
- Users must manually return to review content

#### Recall
- **Spaced Repetition:** Scientific scheduling of content review
- **Active Recall:** Quiz generation from saved content
- **Review Dashboard:** Personalized learning schedule
- **Goal:** "Forget Nothing" - active retention vs passive storage

**Impact:** Our notes become a "digital graveyard" where content goes to be forgotten.

---

### 5. Browser Integration

#### Our System
- Manual URL paste into web app
- No context preservation from browsing session
- No quick-save capability

#### Recall
- **Browser Extension:** One-click save from any page
- **Augmented Browsing:** While browsing, related saved content surfaces in real-time
- **Context Aware:** Knows what you're looking at and connects it to your knowledge base

**Impact:** Friction to add content = less content saved.

---

## Recommended Improvements (Priority Order)

### P0 - Critical Gaps

1. **Video Transcript Extraction**
   - Integrate YouTube transcript API
   - Apply AI summarization to transcripts
   - Store full transcript in `fullContent` field
   - Makes video content searchable via RAG

2. **Image Display in UI**
   - Display saved images prominently in note cards
   - Show inline images from articles
   - Preserve visual context

3. **Knowledge Graph Visualization**
   - Add graph view alongside list/grid
   - Auto-link notes sharing topics
   - Visual exploration of connections

### P1 - High Value

4. **Browser Extension**
   - Chrome extension for one-click save
   - Auto-populate title, excerpt, image
   - Reduce friction to capture

5. **Spaced Repetition System**
   - Track last review date
   - Calculate optimal review intervals
   - Generate simple quizzes from key insights
   - "Review Queue" in UI

6. **Block Editor for Notes**
   - Rich text editing for personal notes
   - Inline links to other notes
   - Better than plain text content field

### P2 - Nice to Have

7. **Augmented Browsing**
   - Show related saved notes on current page
   - Requires browser extension

8. **Manual Linking**
   - "@" or "/" commands to link notes
   - Bi-directional links

9. **Export to Markdown**
   - User data portability
   - Integration with Obsidian, Notion, etc.

10. **Podcast Support**
    - Audio transcript extraction
    - Similar to video handling

---

## Implementation Roadmap

### Phase 1: Media First (2-3 weeks)
- [ ] YouTube transcript extraction via API
- [ ] Display images properly in note cards
- [ ] Video embed in note detail view
- [ ] Summarize video transcripts

### Phase 2: Visual Organization (2-3 weeks)
- [ ] Knowledge graph data model (topics as nodes)
- [ ] Graph visualization component (D3.js or similar)
- [ ] Auto-link notes by shared topics
- [ ] Topic clustering view

### Phase 3: Active Learning (2 weeks)
- [ ] Add `lastReviewedAt`, `nextReviewAt` fields
- [ ] Spaced repetition algorithm
- [ ] Review queue UI
- [ ] Simple quiz generation from key insights

### Phase 4: Browser Extension (3-4 weeks)
- [ ] Chrome extension scaffold
- [ ] Quick-save popup
- [ ] Auth token handling
- [ ] Augmented browsing (show related notes)

---

## Technical Notes

### Video Transcript Extraction
```typescript
// YouTube provides captions via timedtext API
// Libraries: youtube-transcript, youtubei.js

import { YoutubeTranscript } from 'youtube-transcript';

const transcript = await YoutubeTranscript.fetchTranscript(videoId);
const fullText = transcript.map(t => t.text).join(' ');

// Then process like any other text content
```

### Knowledge Graph Schema Addition
```prisma
model NoteTopic {
  id        String   @id @default(cuid())
  name      String   @unique
  notes     Note[]   @relation("NoteTopics")
  relatedTo NoteTopic[] @relation("TopicRelations")
  relatedBy NoteTopic[] @relation("TopicRelations")
}

// Add to Note model:
model Note {
  // ... existing fields
  linkedNotes   Note[] @relation("NoteLinks")
  linkedBy      Note[] @relation("NoteLinks")
}
```

### Spaced Repetition Fields
```prisma
model Note {
  // ... existing fields
  lastReviewedAt  DateTime?
  nextReviewAt    DateTime?
  reviewCount     Int       @default(0)
  easeFactor      Float     @default(2.5)  // SM-2 algorithm
}
```

---

## Conclusion

Our notes system has a solid foundation with AI processing, semantic search, and RAG chat. However, Recall differentiates itself through:

1. **Media preservation** - Content stays rich, not stripped to text
2. **Visual knowledge graph** - Connections are visible and explorable
3. **Active learning** - Spaced repetition prevents "digital hoarding"
4. **Low-friction capture** - Browser extension makes saving effortless

Addressing these gaps would transform our notes from a "save and forget" tool into a true "second brain" knowledge system.

---

## References

- [Recall AI Homepage](https://www.getrecall.ai/)
- [Recall Documentation](https://docs.getrecall.ai/)
- [Recall Chrome Extension](https://chromewebstore.google.com/detail/recall-summarize-anything/ldbooahljamnocpaahaidnmlgfklbben)
