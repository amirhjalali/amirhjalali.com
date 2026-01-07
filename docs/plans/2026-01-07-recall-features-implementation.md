# Recall-Style Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform notes.amirhjalali.com into a full-featured knowledge management system matching getrecall.ai capabilities.

**Architecture:** Progressive enhancement of existing infrastructure. The system already has ~70% of backend services (embeddings, knowledge graph, spaced repetition, AI processing). Focus on completing missing backend features, enhancing the browser extension, and building out the frontend experience.

**Tech Stack:** Next.js 15, PostgreSQL/Prisma, OpenAI (GPT-4o-mini + text-embedding-3-small), Redis (job queue), Cloudflare R2 (media storage), Chrome Extension APIs.

---

## Current State Analysis

### Already Implemented (Backend)
- AI-powered content summarization and key insight extraction
- Semantic search with vector embeddings (text-embedding-3-small)
- Knowledge graph with topic extraction and auto-linking
- Spaced repetition (SM-2 algorithm) with review queue
- Content extraction for URLs, YouTube (with transcript)
- Background job processing with Redis queue
- Rate limiting and error handling middleware

### Already Implemented (Frontend)
- Notes list with filters (type, status, search, sort)
- Quick add for URLs and text
- Knowledge graph visualization (force-directed)
- Review queue with flashcard interface
- Semantic search component
- Note detail view with metadata

### Already Implemented (Browser Extension)
- Basic manifest and popup structure
- Service worker skeleton
- Options page

### Gaps to Fill
1. Browser Extension - Not functional, needs complete implementation
2. Chat Interface - Backend exists but no frontend
3. PDF Processing - Service exists but untested/incomplete
4. Google Docs/Slides Support - Not implemented
5. Data Export - Not implemented
6. Augmented Browsing - Not implemented (show related notes on current page)
7. Mobile PWA - No mobile-optimized experience
8. Notebooks/Collections - Schema exists, no UI
9. Duplicate Detection - Hash exists but no UI feedback
10. Daily Digest/Review Reminders - Not implemented

---

## Phase 1: Browser Extension (Core Capture)

### Task 1: Extension Popup UI

**Files:**
- Modify: `browser-extension/src/popup/popup.html`
- Modify: `browser-extension/src/popup/popup.css`
- Modify: `browser-extension/src/popup/popup.js`

**Step 1: Write the popup HTML structure**

Create a clean HTML file with the following structure:
- Header with logo and title
- Auth required section (hidden by default)
- Main content with page info, save button, optional fields
- Recent saves section
- Footer with links

**Step 2: Write the popup CSS**

Style with dark theme matching the main app:
- Background: #0a0a0a
- Text: #EAEAEA
- Muted: #888888
- Borders: rgba(255,255,255,0.1)
- Primary button: white bg, black text

**Step 3: Write the popup JavaScript**

Key functions using SAFE DOM methods only:
- `checkAuth()` - Test API call to verify session
- `getCurrentTab()` - Get active tab info
- `savePage()` - POST to /api/notes with type LINK
- `loadRecentSaves()` - Load from chrome.storage.local
- `renderRecentSaves(saves)` - Use createElement and textContent

IMPORTANT: Use only safe DOM manipulation:
- document.createElement() to create elements
- element.textContent = value for text
- element.appendChild() to add to DOM
- element.classList.add/remove() for styling
- NEVER use element.innerHTML with dynamic content

**Step 4: Run manual test in browser**

Load extension in Chrome:
1. Navigate to chrome://extensions
2. Enable Developer mode
3. Click Load unpacked and select browser-extension folder
4. Click extension icon to test popup

Expected: Popup displays with page info, save button functional

**Step 5: Commit**

```bash
git add browser-extension/src/popup/
git commit -m "feat(extension): Implement popup UI for one-click page saving"
```

---

### Task 2: Extension Service Worker

**Files:**
- Modify: `browser-extension/src/background/service-worker.js`
- Modify: `browser-extension/manifest.json`

**Step 1: Update manifest.json with proper permissions**

Required permissions:
- activeTab
- storage
- contextMenus
- cookies

Host permissions:
- https://amirhjalali.com/*
- https://www.amirhjalali.com/*

Add commands for keyboard shortcut (Alt+Shift+S)

**Step 2: Write service worker with context menu and keyboard shortcut**

Implement:
- chrome.runtime.onInstalled - Create context menus
- chrome.contextMenus.onClicked - Handle save-page, save-link, save-selection, save-image
- chrome.commands.onCommand - Handle save-page shortcut
- saveToNotes(data) - POST to API with credentials
- showNotification(title, message) - Update badge/title

**Step 3: Test context menus and keyboard shortcut**

Manual test:
1. Right-click on page - Save page to Notes should work
2. Right-click on link - Save link to Notes should work
3. Select text, right-click - Save selection to Notes should work
4. Press Alt+Shift+S - Should save current page

**Step 4: Commit**

```bash
git add browser-extension/
git commit -m "feat(extension): Add context menus and keyboard shortcuts for quick saving"
```

---

### Task 3: Extension Icons

**Files:**
- Create: `browser-extension/src/icons/icon16.png`
- Create: `browser-extension/src/icons/icon32.png`
- Create: `browser-extension/src/icons/icon48.png`
- Create: `browser-extension/src/icons/icon128.png`

**Step 1: Create icons**

Option A: Use canvas library (Node.js script with canvas package)
Option B: Create simple icons manually using design tool
Option C: Use existing favicon from main site

Design: White circle background with black document icon

**Step 2: Add icons to extension**

Place in browser-extension/src/icons/ directory

**Step 3: Commit**

```bash
git add browser-extension/src/icons/
git commit -m "feat(extension): Add extension icons"
```

---

## Phase 2: Chat Interface with Knowledge Base

### Task 4: Chat UI Component

**Files:**
- Create: `app/notes/components/NotesChatPanel.tsx`

**Step 1: Create the chat panel component**

React component with:
- State: messages[], input, isLoading
- Refs: messagesEnd, inputRef
- Functions: sendMessage(), handleKeyDown()
- UI: Modal with header, messages area, input field
- Display sources with links to notes
- Suggested questions when empty

Use React patterns for rendering:
- Map over messages array returning JSX elements
- Use React state and props for all dynamic content
- No raw HTML string injection

**Step 2: Run build to verify**

```bash
npm run build
```

Expected: Build succeeds without errors

**Step 3: Commit**

```bash
git add app/notes/components/NotesChatPanel.tsx
git commit -m "feat(notes): Add chat panel component for knowledge base Q&A"
```

---

### Task 5: Integrate Chat into Notes Page

**Files:**
- Modify: `app/notes/NotesPageClient.tsx`

**Step 1: Add chat button and panel to notes page**

- Import NotesChatPanel and MessageSquare icon
- Add state: const [showChat, setShowChat] = useState(false)
- Add button in header actions
- Add panel at bottom of component

**Step 2: Run build to verify**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/notes/NotesPageClient.tsx
git commit -m "feat(notes): Integrate chat panel into notes page"
```

---

## Phase 3: Data Export

### Task 6: Export API Endpoint

**Files:**
- Create: `app/api/notes/export/route.ts`

**Step 1: Write the export API**

GET endpoint with query param format (markdown or json):
- Validate session
- Fetch all processed notes with topics
- For JSON: Return structured object with metadata
- For Markdown: Build string with note sections
- Set appropriate Content-Type and Content-Disposition headers

**Step 2: Run build to verify**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/api/notes/export/route.ts
git commit -m "feat(api): Add notes export endpoint for markdown and JSON"
```

---

### Task 7: Export Button in UI

**Files:**
- Modify: `app/notes/NotesPageClient.tsx`

**Step 1: Add export button**

- Import Download icon
- Add handleExport(format) function that fetches, creates blob, triggers download
- Add dropdown button in header with Markdown and JSON options

**Step 2: Run build to verify**

```bash
npm run build
```

**Step 3: Commit**

```bash
git add app/notes/NotesPageClient.tsx
git commit -m "feat(notes): Add export button for markdown and JSON download"
```

---

## Phase 4: Notebooks/Collections

### Task 8: Notebooks API

**Files:**
- Create: `app/api/notes/notebooks/route.ts`
- Create: `app/api/notes/notebooks/[id]/route.ts`

**Step 1: Create notebooks list/create endpoint**

GET: Fetch all notebooks with note counts
POST: Create new notebook with title, description, color, icon

**Step 2: Create single notebook endpoint**

GET: Fetch notebook with notes
PATCH: Update notebook fields
DELETE: Delete notebook (notes get notebookId set to null)

**Step 3: Run build to verify**

```bash
npm run build
```

**Step 4: Commit**

```bash
git add app/api/notes/notebooks/
git commit -m "feat(api): Add notebooks CRUD endpoints"
```

---

## Phase 5: PDF Processing Enhancement

### Task 9: Test and Fix PDF Processing

**Files:**
- Modify: `lib/pdf-processing-service.ts`
- Create: `__tests__/lib/pdf-processing-service.test.ts`

**Step 1: Write tests for PDF service**

Test cases:
- extractPdfText with invalid buffer should throw
- processPdfUrl with invalid URL should throw
- processPdfUrl with non-PDF URL should throw

**Step 2: Run tests**

```bash
npm test -- --testPathPattern=pdf-processing
```

**Step 3: Fix any failing issues**

Ensure proper error handling with try/catch and meaningful error messages

**Step 4: Commit**

```bash
git add lib/pdf-processing-service.ts __tests__/lib/pdf-processing-service.test.ts
git commit -m "test(pdf): Add PDF processing tests and improve error handling"
```

---

## Phase 6: Augmented Browsing (Content Script)

### Task 10: Content Script for Related Notes

**Files:**
- Modify: `browser-extension/src/content/content.js`
- Modify: `browser-extension/src/content/content.css`
- Modify: `browser-extension/manifest.json`

**Step 1: Update manifest to inject content script**

Add content_scripts array with matches, js, css, run_at

**Step 2: Write content script for sidebar**

Functions using SAFE DOM methods:
- createSidebar() - Build sidebar using createElement only
- searchRelatedNotes() - POST to /api/notes/search
- renderRelatedNotes(notes) - Create elements for each note using createElement
- toggleSidebar() - Show/hide sidebar
- Message listener for toggle-sidebar action

SECURITY: All DOM manipulation must use:
- document.createElement(tagName)
- element.textContent = value
- element.appendChild(child)
- element.setAttribute(name, value)
- element.classList methods

**Step 3: Write content script CSS**

Styles for:
- Fixed sidebar on right
- Header with close button
- Scrollable content area
- Note items with hover states

**Step 4: Test extension**

Reload extension and test on a webpage

**Step 5: Commit**

```bash
git add browser-extension/
git commit -m "feat(extension): Add content script for related notes sidebar"
```

---

## Summary: Feature Comparison

| Feature | Recall | Our Implementation |
|---------|--------|-------------------|
| Browser Extension (Save) | Yes | Phase 1: Task 1-3 |
| Context Menu Save | Yes | Phase 1: Task 2 |
| Keyboard Shortcut | Yes | Phase 1: Task 2 |
| AI Summaries | Yes | Already done |
| Knowledge Graph | Yes | Already done |
| Spaced Repetition | Yes | Already done |
| Semantic Search | Yes | Already done |
| Chat with KB | Yes | Phase 2: Task 4-5 |
| Data Export (Markdown) | Yes | Phase 3: Task 6-7 |
| Notebooks/Collections | Yes | Phase 4: Task 8 |
| PDF Processing | Yes | Phase 5: Task 9 |
| Augmented Browsing | Yes | Phase 6: Task 10 |
| YouTube Transcripts | Yes | Already done |
| Link Content Extraction | Yes | Already done |

---

## Security Requirements

All browser extension code MUST use safe DOM manipulation:
- Use createElement() to create elements
- Use textContent for plain text content
- Use appendChild() to add elements to DOM
- Use setAttribute() for attributes
- NEVER inject HTML strings directly into the DOM
- If HTML rendering is absolutely required, use DOMPurify library

---

## Total Tasks: 10

Each task follows TDD principles with clear verification steps.
