# Notes Feature Validation Plan

This document outlines the validation steps to ensure all Notes Feature functionality is working correctly.

## Prerequisites

Before starting validation:

- [ ] PostgreSQL database is running and accessible
- [ ] Redis is running (local or remote)
- [ ] Environment variables are configured in `.env`
- [ ] Dependencies are installed (`npm install`)
- [ ] Database schema is up to date (`npx prisma db push`)

## Validation Phases

### Phase 1: Database & Schema Validation

#### 1.1 Verify Database Schema

```bash
# Check Prisma schema is in sync
npx prisma db push

# Open Prisma Studio to inspect database
npx prisma studio
```

**Expected Results:**
- Note table exists with all fields
- NoteType enum: LINK, TEXT, IMAGE, VIDEO
- ProcessStatus enum: PENDING, PROCESSING, COMPLETED, FAILED
- NoteArticleRef junction table exists
- Indexes are created on processStatus, type, and createdAt

**Validation Checklist:**
- [ ] Note table visible in Prisma Studio
- [ ] All enum types are correct
- [ ] Relations to Article table work
- [ ] No schema drift errors

---

### Phase 2: Development Server & Basic Connectivity

#### 2.1 Start Development Server

```bash
npm run dev
```

**Expected Results:**
- Server starts on http://localhost:3000
- No compilation errors
- TypeScript types are valid

**Validation Checklist:**
- [ ] Development server starts successfully
- [ ] No TypeScript errors in terminal
- [ ] Can access http://localhost:3000

#### 2.2 Test Redis Connection

```bash
# In a separate terminal
node -e "
const { testRedisConnection } = require('./lib/redis.ts');
testRedisConnection().then(() => process.exit(0)).catch(() => process.exit(1));
"
```

**Expected Results:**
- "✅ Redis connection test successful" message
- No connection errors

**Validation Checklist:**
- [ ] Redis connection successful
- [ ] No authentication errors
- [ ] No timeout errors

---

### Phase 3: Authentication & Navigation

#### 3.1 Access Notes Subdomain (Local)

Add to `/etc/hosts`:
```
127.0.0.1 notes.localhost
```

Visit: http://notes.localhost:3000

**Expected Results:**
- Redirects to /notes/login (if not authenticated)
- OR shows notes dashboard (if authenticated)

**Validation Checklist:**
- [ ] notes.localhost resolves correctly
- [ ] Middleware routing works (subdomain → /notes path)
- [ ] Authentication check works
- [ ] Login page displays correctly

#### 3.2 Login to Notes App

**Test Cases:**
1. Enter valid admin credentials
2. Click "Sign In"

**Expected Results:**
- Successful authentication
- Redirect to /notes dashboard
- Session cookie set (admin_session)

**Validation Checklist:**
- [ ] Login form accepts input
- [ ] Authentication succeeds with valid credentials
- [ ] Redirects to dashboard after login
- [ ] Session persists across page reloads

---

### Phase 4: Notes CRUD Operations (UI)

#### 4.1 Create Notes via QuickAdd

**Test Case 1: Create TEXT Note**
1. Go to http://notes.localhost:3000
2. Enter text in QuickAdd input: "This is a test note for validation"
3. Tags: "test, validation"
4. Click "Add Note"

**Expected Results:**
- Note created successfully
- Toast/success message appears
- Note appears in notes list
- Status shows "PENDING" or "PROCESSING"

**Validation Checklist:**
- [ ] QuickAdd form renders correctly
- [ ] Can type in input field
- [ ] Tags can be added
- [ ] Note creation succeeds
- [ ] Note appears in list immediately

**Test Case 2: Create LINK Note**
1. Enter URL: "https://github.com/anthropics/claude-code"
2. Tags: "ai, coding"
3. Click "Add Note"

**Expected Results:**
- Auto-detected as LINK type
- Note created with URL as content
- Auto-processing should start

**Validation Checklist:**
- [ ] URL auto-detection works
- [ ] Type selector shows LINK
- [ ] Note created successfully
- [ ] Auto-processing queued (check jobId in response)

**Test Case 3: Create IMAGE Note**
1. Select type: IMAGE
2. Enter image URL: "https://example.com/image.jpg"
3. Add title: "Test Image"
4. Click "Add Note"

**Expected Results:**
- Note created with IMAGE type
- Title saved correctly

**Validation Checklist:**
- [ ] Manual type selection works
- [ ] IMAGE type note created
- [ ] Title field saves correctly

#### 4.2 View Notes List

**Test Cases:**
1. Check notes list displays all created notes
2. Verify note cards show:
   - Type icon (Link, Text, Image, Video)
   - Processing status indicator
   - Title (if present)
   - Excerpt/content preview
   - Tags (first 3 + count)
   - Created timestamp

**Validation Checklist:**
- [ ] Notes list renders correctly
- [ ] All notes visible
- [ ] Type icons display correctly
- [ ] ProcessingIndicator component works
- [ ] Tags display with overflow handling
- [ ] Timestamps show relative time

#### 4.3 Filter and Search Notes

**Test Cases:**
1. **Type Filter**: Select "LINK" from filter
2. **Search**: Enter "test" in search box
3. **Sort**: Change sort order to "Title A-Z"
4. **Clear Filters**: Click clear button

**Expected Results:**
- Type filter shows only LINK notes
- Search filters by title/content/excerpt
- Sort reorders notes correctly
- Clear filters resets to default view

**Validation Checklist:**
- [ ] Type filter works
- [ ] Search is debounced (300ms delay)
- [ ] Search filters correctly
- [ ] Sort options work
- [ ] Clear filters resets everything

#### 4.4 View Individual Note

**Test Cases:**
1. Click on a note card
2. Navigate to `/notes/[id]`

**Expected Results:**
- Note detail page loads
- Shows full content
- Shows processing status
- Shows AI results (if completed)
- Edit/Delete buttons visible

**Validation Checklist:**
- [ ] Individual note page loads
- [ ] All note fields display correctly
- [ ] Processing status visible
- [ ] AI results section shows (if completed)
- [ ] Edit/Delete actions available

#### 4.5 Edit Note

**Test Cases:**
1. Click "Edit" button on note detail page
2. Modify title: "Updated Test Note"
3. Add new tag: "edited"
4. Click "Save"

**Expected Results:**
- Edit mode activates
- Fields become editable
- Save updates note
- Changes persist after reload

**Validation Checklist:**
- [ ] Edit mode toggles correctly
- [ ] All fields are editable
- [ ] Save updates database
- [ ] Changes visible immediately
- [ ] Cancel discards changes

#### 4.6 Delete Note

**Test Cases:**
1. Click "Delete" button
2. Confirm deletion
3. Verify note removed from list

**Expected Results:**
- Confirmation dialog appears
- Note deleted from database
- Redirects to notes list
- Note no longer visible

**Validation Checklist:**
- [ ] Delete confirmation shows
- [ ] Note deleted successfully
- [ ] Removed from list
- [ ] Database record deleted

---

### Phase 5: API Endpoints (Direct Testing)

#### 5.1 Test Notes API Endpoints

**Test GET /api/notes**
```bash
curl http://localhost:3000/api/notes \
  -H "Cookie: admin_session=YOUR_SESSION_COOKIE"
```

**Expected Response:**
```json
{
  "notes": [...],
  "total": 3,
  "hasMore": false
}
```

**Validation Checklist:**
- [ ] Returns notes array
- [ ] Returns total count
- [ ] Returns hasMore flag
- [ ] Authentication required (401 without session)

**Test POST /api/notes**
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_SESSION_COOKIE" \
  -d '{
    "type": "TEXT",
    "content": "API test note",
    "title": "Test via API",
    "tags": ["api", "test"]
  }'
```

**Expected Response:**
```json
{
  "note": {
    "id": "...",
    "type": "TEXT",
    "content": "API test note",
    ...
  },
  "jobId": "note-...-timestamp"
}
```

**Validation Checklist:**
- [ ] Note created successfully
- [ ] Returns note object
- [ ] Returns jobId (for auto-processing)
- [ ] Note appears in database

**Test GET /api/notes/[id]**
```bash
curl http://localhost:3000/api/notes/NOTE_ID \
  -H "Cookie: admin_session=YOUR_SESSION_COOKIE"
```

**Expected Response:**
```json
{
  "id": "...",
  "type": "TEXT",
  "content": "...",
  "processStatus": "PENDING",
  ...
}
```

**Validation Checklist:**
- [ ] Returns single note
- [ ] All fields present
- [ ] 404 for invalid ID

**Test PATCH /api/notes/[id]**
```bash
curl -X PATCH http://localhost:3000/api/notes/NOTE_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_SESSION_COOKIE" \
  -d '{
    "title": "Updated via API",
    "tags": ["updated"]
  }'
```

**Expected Response:**
```json
{
  "id": "...",
  "title": "Updated via API",
  "tags": ["updated"],
  ...
}
```

**Validation Checklist:**
- [ ] Note updated successfully
- [ ] Changes persisted
- [ ] Returns updated note

**Test DELETE /api/notes/[id]**
```bash
curl -X DELETE http://localhost:3000/api/notes/NOTE_ID \
  -H "Cookie: admin_session=YOUR_SESSION_COOKIE"
```

**Expected Response:** 204 No Content

**Validation Checklist:**
- [ ] Note deleted
- [ ] Returns 204 status
- [ ] Note removed from database

#### 5.2 Test Processing API Endpoints

**Test POST /api/notes/[id]/process**
```bash
curl -X POST http://localhost:3000/api/notes/NOTE_ID/process \
  -H "Cookie: admin_session=YOUR_SESSION_COOKIE"
```

**Expected Response:**
```json
{
  "jobId": "note-...-timestamp",
  "status": "queued",
  "message": "Note processing queued successfully"
}
```

**Validation Checklist:**
- [ ] Returns jobId
- [ ] Returns status message
- [ ] Job added to Redis queue
- [ ] Note status updated to PENDING

**Test POST /api/notes/process-batch**
```bash
curl -X POST http://localhost:3000/api/notes/process-batch \
  -H "Content-Type: application/json" \
  -H "Cookie: admin_session=YOUR_SESSION_COOKIE" \
  -d '{
    "noteIds": ["NOTE_ID_1", "NOTE_ID_2"]
  }'
```

**Expected Response:**
```json
{
  "jobIds": ["job1", "job2"],
  "queued": 2,
  "skipped": 0,
  "message": "2 notes queued for processing"
}
```

**Validation Checklist:**
- [ ] Returns array of jobIds
- [ ] Returns queued count
- [ ] All jobs added to queue
- [ ] Max 50 notes enforced

**Test GET /api/notes/jobs/[jobId]**
```bash
curl http://localhost:3000/api/notes/jobs/JOB_ID \
  -H "Cookie: admin_session=YOUR_SESSION_COOKIE"
```

**Expected Response:**
```json
{
  "jobId": "...",
  "status": "processing",
  "progress": 50,
  "result": null,
  "error": null,
  "attempts": 1,
  "maxAttempts": 3
}
```

**Validation Checklist:**
- [ ] Returns job status
- [ ] Shows progress (0-100)
- [ ] Shows attempts
- [ ] 404 for invalid jobId

---

### Phase 6: Background Worker & AI Processing

#### 6.1 Start Background Worker

```bash
# In a separate terminal
node scripts/note-worker.js
```

**Expected Output:**
```
============================================================
📝 Note Processing Worker Starting...
============================================================

Environment: development
Redis URL: redis://localhost:6379
Database URL: ✓ Set
OpenAI API Key: ✓ Set

============================================================
✅ Worker started successfully!
============================================================

Worker is now listening for jobs...
Press Ctrl+C to stop
```

**Validation Checklist:**
- [ ] Worker starts without errors
- [ ] Environment variables detected
- [ ] Connects to Redis successfully
- [ ] Ready to process jobs

#### 6.2 Test Auto-Processing

**Test Case:**
1. Create a new LINK note via UI: "https://github.com"
2. Observe worker logs
3. Watch processing status in UI

**Expected Worker Logs:**
```
────────────────────────────────────────────────────────────
📌 Processing Note: clxxxxx
   Job ID: note-clxxxxx-timestamp
   Attempt: 1/3
────────────────────────────────────────────────────────────

📎 Extracting metadata for URL: https://github.com
🤖 Generating AI summary and insights
🏷️  Extracting topics
😊 Analyzing sentiment

✅ Successfully processed note clxxxxx
   Status: COMPLETED
   Summary: Generated
   Topics: 3 found
   Insights: 4 extracted
```

**Validation Checklist:**
- [ ] Worker picks up job automatically
- [ ] Metadata extraction runs
- [ ] OpenAI API calls succeed
- [ ] Note status updates to COMPLETED
- [ ] Results saved to database

#### 6.3 Verify AI Processing Results

**Test Case:**
1. Open the processed note in UI
2. Check "AI Analysis" section

**Expected Results:**
- Summary: 1-2 paragraphs
- Excerpt: 2-3 sentences
- Key Insights: 3-5 bullet points
- Topics: 3-10 topic tags
- Sentiment: positive/negative/neutral/mixed
- Metadata (for LINK notes): title, description, image, domain

**Validation Checklist:**
- [ ] Summary generated and displayed
- [ ] Excerpt visible in note card
- [ ] Key insights listed
- [ ] Topics displayed as tags
- [ ] Sentiment analyzed
- [ ] Metadata extracted (LINK notes)

#### 6.4 Test Processing Retry

**Test Case 1: Failed Processing**
1. Stop OpenAI API (or use invalid key temporarily)
2. Create a new note
3. Observe worker retry logic

**Expected Results:**
- Job fails initially
- Worker retries with exponential backoff (2s, 4s, 8s)
- After 3 attempts, status = FAILED
- Error message stored

**Validation Checklist:**
- [ ] Worker retries failed jobs
- [ ] Exponential backoff works
- [ ] Max retries enforced (3)
- [ ] Error message captured
- [ ] Status updates to FAILED

**Test Case 2: Manual Retry**
1. Click retry button on failed note
2. Observe worker processes the job

**Expected Results:**
- New job queued
- Status changes to PENDING
- Worker processes successfully
- Status updates to COMPLETED

**Validation Checklist:**
- [ ] Retry button triggers new job
- [ ] Processing starts again
- [ ] Can recover from failures

---

### Phase 7: Real-Time UI Updates

#### 7.1 Test ProcessingIndicator Component

**Test Cases:**
1. Create new note
2. Watch status indicator update in real-time
3. Observe color changes and animations

**Expected Behavior:**
- PENDING: Yellow with clock icon
- PROCESSING: Blue with spinning loader
- COMPLETED: Green with checkmark
- FAILED: Red with X icon + retry button

**Validation Checklist:**
- [ ] Status indicator updates automatically
- [ ] Polls every 2 seconds while processing
- [ ] Stops polling when completed/failed
- [ ] Visual states match status correctly
- [ ] Progress percentage shows (if available)

#### 7.2 Test Grid/List View Toggle

**Test Cases:**
1. Switch to list view
2. Switch to grid view
3. Verify notes display correctly in both

**Validation Checklist:**
- [ ] Grid view shows cards in grid
- [ ] List view shows cards in vertical list
- [ ] Toggle button works
- [ ] Layout updates smoothly

#### 7.3 Test Pagination

**Test Cases:**
1. Create more than 50 notes (or adjust limit)
2. Navigate to next page
3. Navigate to previous page

**Validation Checklist:**
- [ ] Pagination controls appear
- [ ] Next/Previous buttons work
- [ ] Page number displays correctly
- [ ] Disabled states work (first/last page)

---

### Phase 8: Edge Cases & Error Handling

#### 8.1 Invalid Input Validation

**Test Cases:**
1. Create note with empty content
2. Create note with invalid type
3. Update note with invalid data
4. Delete non-existent note

**Expected Results:**
- API returns 400 Bad Request
- Error messages displayed
- No database corruption

**Validation Checklist:**
- [ ] Empty content rejected
- [ ] Invalid type rejected
- [ ] Validation errors shown clearly
- [ ] Database remains consistent

#### 8.2 Unauthenticated Access

**Test Cases:**
1. Clear session cookie
2. Try to access /notes
3. Try to call API endpoints without auth

**Expected Results:**
- Redirect to /notes/login
- API returns 401 Unauthorized

**Validation Checklist:**
- [ ] Redirects to login when unauthenticated
- [ ] API rejects unauthenticated requests
- [ ] No data leaks

#### 8.3 Concurrent Processing

**Test Cases:**
1. Trigger processing for same note twice quickly
2. Try to delete note while processing

**Expected Results:**
- Duplicate processing prevented
- Delete disabled during processing
- No race conditions

**Validation Checklist:**
- [ ] Duplicate jobs prevented
- [ ] Actions disabled during processing
- [ ] No conflicts or data corruption

#### 8.4 Worker Crash Recovery

**Test Cases:**
1. Kill worker process (Ctrl+C)
2. Start worker again
3. Verify jobs resume

**Expected Results:**
- Worker shuts down gracefully
- Jobs remain in queue
- Resume processing on restart

**Validation Checklist:**
- [ ] Graceful shutdown works
- [ ] Jobs not lost
- [ ] Processing resumes correctly

---

### Phase 9: Performance & Load Testing

#### 9.1 Bulk Operations

**Test Case:**
1. Create 10 notes via API (loop/script)
2. Select all 10 notes
3. Process batch (future feature)

**Validation Checklist:**
- [ ] Multiple notes created quickly
- [ ] Database handles concurrent inserts
- [ ] Worker processes multiple jobs
- [ ] UI remains responsive

#### 9.2 Long Content Processing

**Test Case:**
1. Create note with 5000+ characters
2. Trigger processing

**Expected Results:**
- Content truncated to 2000 tokens
- Processing completes successfully
- No timeout errors

**Validation Checklist:**
- [ ] Long content handled
- [ ] Token limits enforced
- [ ] Processing completes
- [ ] Costs remain reasonable

---

### Phase 10: Production Readiness

#### 10.1 Environment Variables

**Checklist:**
- [ ] DATABASE_URL set and valid
- [ ] REDIS_URL set and valid
- [ ] OPENAI_API_KEY set and valid
- [ ] ENABLE_AUTO_PROCESSING configured
- [ ] All secrets in Coolify/production

#### 10.2 Error Logging

**Checklist:**
- [ ] Worker logs all errors
- [ ] API endpoints log failures
- [ ] Error messages are helpful
- [ ] No sensitive data in logs

#### 10.3 Documentation Review

**Checklist:**
- [ ] NOTES_DEPLOYMENT.md accurate
- [ ] NOTES_WORKER.md complete
- [ ] Environment variables documented
- [ ] Troubleshooting guide works

---

## Validation Summary

After completing all phases, mark overall status:

### Phase Completion

- [ ] Phase 1: Database & Schema ✅
- [ ] Phase 2: Dev Server & Connectivity ✅
- [ ] Phase 3: Authentication & Navigation ✅
- [ ] Phase 4: Notes CRUD Operations ✅
- [ ] Phase 5: API Endpoints ✅
- [ ] Phase 6: Background Worker & AI ✅
- [ ] Phase 7: Real-Time UI Updates ✅
- [ ] Phase 8: Edge Cases & Errors ✅
- [ ] Phase 9: Performance & Load ✅
- [ ] Phase 10: Production Readiness ✅

### Critical Issues Found

Document any critical issues discovered during validation:

1. Issue: [Description]
   - Severity: High/Medium/Low
   - Steps to reproduce:
   - Expected behavior:
   - Actual behavior:
   - Status: Open/Fixed

### Sign-off

- [ ] All critical functionality validated
- [ ] No critical bugs found
- [ ] Documentation accurate
- [ ] Ready for production deployment

---

**Validation Date:** _____________
**Validated By:** _____________
**Sign-off:** _____________
