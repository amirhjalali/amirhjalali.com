# Step 2: Data Source Analysis

## All Article Data Files

### Source 1: /data/published.mjs
```bash
Count: 14 articles
IDs: article-1 through article-14
Usage: Server-side article loading via lib/server/articles.ts
Type: ES Module with baseArticles export
```

### Source 2: /public/data/published.json  
```bash
Count: 14 articles
IDs: article-1 through article-14
Usage: Client-side fallback, admin panel
Type: JSON array
```

### Source 3: /public/data/drafts.json
```bash
Count: 4 articles
IDs: 
  - article-1762105212777-e3c137xvi (Programming Paradigms)
  - article-1762105641707-i0m4pm18z (Debugging Strategies)
  - article-1762161041527-b4907w0tw (Visopsys)
  - article-1762333808906-l3fte9apl (Claude Code)
Usage: Draft articles from AI generation
Type: JSON array
```

## Component Data Flow Mapping

### Thoughts List Page (/app/thoughts/page.tsx)
- Reads from: `getPublishedArticles()` 
- Which reads from: `/data/published.mjs`
- Result: Shows 14 articles

### Individual Article Page (/app/thoughts/[id]/page.tsx)
- Server: `getPublishedArticleById()` from `/data/published.mjs`
- Client: Falls back to localStorage via `getArticleById()` or `getDraftArticleById()`
- Result: Can show articles not in published.mjs if in localStorage/drafts

### Admin Panel (/app/admin/page.tsx)
- Published: `getArticles()` from localStorage key 'portfolio_articles'
- Drafts: `getDraftArticles()` from localStorage key 'draft-articles'
- Sync: Reads `/public/data/drafts.json` on init
- Result: May show more than 14 if localStorage has been updated

## Discovery: The Mismatch

**Admin panel "Published Articles (18)" is likely:**
- 14 articles from `/data/published.mjs` (in localStorage 'portfolio_articles')
- 4 articles from `/public/data/drafts.json` (loaded into localStorage 'draft-articles')

**Why article URLs work but don't appear in list:**
- Individual pages have client-side fallback that checks localStorage
- List page only uses server-side data from published.mjs
- Draft articles accessible by URL but not in static build

## Root Cause Identified
The 4 articles in `/public/data/drafts.json` need to be moved to `/data/published.mjs` to appear in the thoughts list.
