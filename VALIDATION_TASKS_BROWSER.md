# Browser Validation Tasks for Antigravity

These tasks require browser access and DOM interaction. Assign to antigravity agent for execution.

---

## TASK 1: Verify Prisma Studio Database Structure

**URL:** http://localhost:5555

**Instructions:**
1. Open http://localhost:5555 in browser
2. Navigate to "Note" model in left sidebar
3. Click "Note" to open table view

**Verify the following fields exist:**
- [ ] id (String, @id)
- [ ] type (Enum: LINK, TEXT, IMAGE, VIDEO)
- [ ] content (String)
- [ ] title (String?)
- [ ] imageUrl (String?)
- [ ] videoUrl (String?)
- [ ] excerpt (String?)
- [ ] metadata (Json?)
- [ ] tags (String[])
- [ ] topics (String[])
- [ ] processStatus (Enum: PENDING, PROCESSING, COMPLETED, FAILED)
- [ ] processedAt (DateTime?)
- [ ] summary (String?)
- [ ] keyInsights (String[])
- [ ] sentiment (String?)
- [ ] createdAt (DateTime)
- [ ] updatedAt (DateTime)

**Verify enum values:**
- Click on "NoteType" enum → Should show: LINK, TEXT, IMAGE, VIDEO
- Click on "ProcessStatus" enum → Should show: PENDING, PROCESSING, COMPLETED, FAILED

**Verify relations:**
- [ ] NoteArticleRef table exists
- [ ] Article table has "noteRefs" relation field

**Expected Result:** All fields, enums, and relations present as specified.

**Report back:** "TASK 1: PASS" or "TASK 1: FAIL - [missing items]"

---

## TASK 2: Start Development Server and Verify No Errors

**Instructions:**
1. Open a new terminal
2. Run: `npm run dev`
3. Wait for compilation to complete (30-60 seconds)
4. Watch for any errors in terminal output

**Verify:**
- [ ] Server starts on http://localhost:3000
- [ ] No TypeScript compilation errors
- [ ] No module resolution errors
- [ ] Message shows: "Ready in [X]s" or "Local: http://localhost:3000"

**Expected terminal output (partial):**
```
  ▲ Next.js 15.x.x
  - Local:        http://localhost:3000
  - Experiments:  optimizePackageImports

 ✓ Compiled successfully
```

**Report back:** "TASK 2: PASS" or "TASK 2: FAIL - [error messages]"

---

## TASK 3: Test Subdomain Routing (Login Redirect)

**Pre-requisite:** Development server must be running

**Instructions:**
1. Add to `/etc/hosts` (macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (Windows):
   ```
   127.0.0.1 notes.localhost
   ```
2. Open browser to: http://notes.localhost:3000
3. Observe the behavior

**Expected Behavior:**
- Page redirects to: http://notes.localhost:3000/notes/login
- Login page displays with:
  - Title: "Notes Login" or similar
  - Username input field
  - Password input field
  - "Sign In" button
  - StickyNote icon or logo

**Verify DOM elements exist:**
- [ ] `<input type="text">` or `<input name="username">`
- [ ] `<input type="password">` or `<input name="password">`
- [ ] `<button>` with text "Sign In" or similar
- [ ] No JavaScript console errors

**Report back:**
- "TASK 3: PASS - Redirected to login page correctly"
- OR "TASK 3: FAIL - [describe what happened]"
- Include screenshot if possible

---

## TASK 4: Test Authentication and Dashboard Access

**Pre-requisite:** At login page (http://notes.localhost:3000/notes/login)

**Instructions:**
1. Enter admin credentials:
   - Username: [Use actual admin username from .env]
   - Password: [Use actual admin password from .env]
2. Click "Sign In" button
3. Wait for redirect

**Expected Behavior:**
- Successful login
- Redirects to: http://notes.localhost:3000/notes (dashboard)
- Dashboard displays:
  - "Your Notes" or similar heading
  - "Quick Add" section with input field
  - "Your Notes" list section (may be empty)

**Verify DOM elements:**
- [ ] Page title/heading exists
- [ ] QuickAdd component visible
- [ ] Input field for adding notes
- [ ] Tag input or tag functionality
- [ ] No authentication errors
- [ ] Session cookie set (check DevTools → Application → Cookies → admin_session)

**Report back:**
- "TASK 4: PASS - Authenticated and dashboard loaded"
- OR "TASK 4: FAIL - [describe error]"

---

## TASK 5: Create a TEXT Note via QuickAdd

**Pre-requisite:** Logged in at dashboard (http://notes.localhost:3000/notes)

**Instructions:**
1. Locate the QuickAdd input field
2. Type: "This is a validation test note for antigravity"
3. Add tags: "test", "validation", "antigravity"
4. Click "Add Note" button
5. Observe the result

**Expected Behavior:**
- Success message appears (toast/alert)
- Note appears in the notes list below
- Note card shows:
  - Type icon (FileText icon for TEXT)
  - Content preview: "This is a validation test note..."
  - Tags: test, validation, antigravity
  - Processing status badge (yellow "PENDING" or blue "PROCESSING")
  - Timestamp

**Verify in DOM:**
- [ ] Note card element added to list
- [ ] ProcessingIndicator component visible
- [ ] Tags displayed
- [ ] No JavaScript errors in console

**Take screenshot** of the created note card

**Report back:**
- "TASK 5: PASS - Note created and visible"
- OR "TASK 5: FAIL - [describe issue]"
- Attach screenshot

---

## TASK 6: Create a LINK Note and Test Auto-Detection

**Pre-requisite:** At dashboard with QuickAdd visible

**Instructions:**
1. In QuickAdd input, paste: "https://github.com/anthropics/claude-code"
2. Add tags: "ai", "coding"
3. Click "Add Note"
4. Observe the result

**Expected Behavior:**
- Type auto-detected as LINK (URL detected)
- Link icon displayed (not FileText)
- Note created successfully
- Processing status badge shows (should auto-process)

**Verify:**
- [ ] Note shows Link icon (chain/link icon)
- [ ] URL is preserved as content
- [ ] ProcessingIndicator shows PENDING or PROCESSING
- [ ] Note appears in list

**Report back:**
- "TASK 6: PASS - LINK note created with auto-detection"
- OR "TASK 6: FAIL - [describe issue]"

---

## TASK 7: Test ProcessingIndicator Real-Time Updates

**Pre-requisite:** At least one note with PENDING/PROCESSING status exists

**Instructions:**
1. Locate a note card with blue "PROCESSING" or yellow "PENDING" badge
2. Watch the ProcessingIndicator for 30 seconds
3. Observe any changes

**Expected Behavior:**
- Status updates automatically (polls every 2 seconds)
- Color may change:
  - Yellow (PENDING) → Blue with spinner (PROCESSING)
  - Blue (PROCESSING) → Green with checkmark (COMPLETED)
  - OR Red with X (FAILED)
- Icon animates (spinner rotates)
- No page reload needed

**Verify in DevTools:**
- Open Network tab
- Filter for: `/api/notes/jobs/`
- Should see periodic requests every ~2 seconds while processing
- Requests stop when status = COMPLETED or FAILED

**Report back:**
- "TASK 7: PASS - Status updates in real-time"
- OR "TASK 7: FAIL - Status doesn't update"
- OR "TASK 7: N/A - Worker not running (status stuck at PENDING)"

---

## TASK 8: Test Individual Note View

**Pre-requisite:** At least one note exists

**Instructions:**
1. Click on any note card in the list
2. Should navigate to: http://notes.localhost:3000/notes/[NOTE_ID]
3. Verify the detail page loads

**Expected Behavior:**
- Full note detail page displays
- Shows:
  - Full content (not truncated)
  - All tags
  - Processing status indicator
  - Edit button
  - Delete button
  - Back button
  - Timestamps (created, updated)

**Verify DOM elements:**
- [ ] Title displays (if note has title)
- [ ] Full content visible
- [ ] Tags displayed
- [ ] ProcessingIndicator component
- [ ] Edit button exists
- [ ] Delete button exists
- [ ] Back button exists

**If note is COMPLETED, verify AI results section:**
- [ ] "AI Analysis" heading visible
- [ ] Summary displayed
- [ ] Key Insights list displayed
- [ ] Topics displayed

**Report back:**
- "TASK 8: PASS - Note detail page works correctly"
- OR "TASK 8: FAIL - [describe issue]"
- Include screenshot

---

## TASK 9: Test Note Editing

**Pre-requisite:** On a note detail page (from TASK 8)

**Instructions:**
1. Click "Edit" button
2. Modify the title: "Edited by Antigravity"
3. Add new tag: "edited"
4. Click "Save" button
5. Verify changes

**Expected Behavior:**
- Edit mode activates (fields become editable)
- Title input field appears
- Content textarea appears
- Tags input appears
- Save and Cancel buttons appear
- After clicking Save:
  - Edit mode exits
  - Changes are visible
  - "Edited by Antigravity" shows as title
  - "edited" tag appears in tags list

**Verify:**
- [ ] Edit button toggles edit mode
- [ ] Fields become editable
- [ ] Save persists changes
- [ ] Cancel discards changes (test by editing again, then canceling)

**Reload page and verify:**
- [ ] Changes persisted (title still "Edited by Antigravity")

**Report back:**
- "TASK 9: PASS - Editing works correctly"
- OR "TASK 9: FAIL - [describe issue]"

---

## TASK 10: Test Note Deletion

**Pre-requisite:** On a note detail page

**Instructions:**
1. Click "Delete" button
2. Confirm deletion in dialog/alert
3. Observe behavior

**Expected Behavior:**
- Confirmation dialog appears ("Are you sure...?")
- After confirming:
  - Redirects to notes list
  - Deleted note no longer appears in list
  - Other notes still visible (if any)

**Verify:**
- [ ] Confirmation prompt appears
- [ ] After deletion, redirects to /notes
- [ ] Note removed from list
- [ ] No errors in console

**Report back:**
- "TASK 10: PASS - Deletion works correctly"
- OR "TASK 10: FAIL - [describe issue]"

---

## TASK 11: Test Filtering and Search

**Pre-requisite:** At dashboard with multiple notes (at least 3-4 notes of different types)

**Instructions:**

**Test 1: Type Filter**
1. Locate filter controls (should have Type dropdown)
2. Select "LINK" from type filter
3. Observe the notes list

**Expected:** Only LINK notes visible

**Test 2: Search**
1. Type "test" in search input
2. Wait 500ms (debounced)
3. Observe the notes list

**Expected:** Only notes with "test" in title/content/excerpt visible

**Test 3: Clear Filters**
1. Click "Clear" or "Reset" button
2. Observe the notes list

**Expected:** All notes visible again

**Verify:**
- [ ] Type filter works
- [ ] Search is debounced (doesn't filter instantly, ~300ms delay)
- [ ] Search filters correctly
- [ ] Clear filters resets view

**Report back:**
- "TASK 11: PASS - Filtering and search work"
- OR "TASK 11: FAIL - [describe issues]"

---

## TASK 12: Test Grid/List View Toggle

**Pre-requisite:** At dashboard with multiple notes

**Instructions:**
1. Locate view toggle buttons (Grid icon and List icon)
2. Click List view button
3. Observe layout change
4. Click Grid view button
5. Observe layout change

**Expected Behavior:**
- **List view:** Notes displayed vertically, one per row
- **Grid view:** Notes displayed in grid (2-3 columns on desktop)
- Toggle buttons highlight active view
- Layout transitions smoothly

**Verify:**
- [ ] Grid view button exists
- [ ] List view button exists
- [ ] Clicking toggles layout
- [ ] Active button is highlighted/styled differently
- [ ] Layout is responsive

**Report back:**
- "TASK 12: PASS - View toggle works"
- OR "TASK 12: FAIL - [describe issue]"

---

## TASK 13: Test Pagination (if applicable)

**Pre-requisite:** More than 50 notes exist (or create dummy notes)

**Instructions:**
1. Scroll to bottom of notes list
2. Locate pagination controls
3. Click "Next" button
4. Observe page change
5. Click "Previous" button

**Expected Behavior:**
- Pagination controls visible at bottom
- Shows current page number
- "Next" loads next 50 notes
- "Previous" loads previous 50 notes
- Disabled state when on first/last page

**Verify:**
- [ ] Pagination controls exist
- [ ] Page number displays
- [ ] Next/Previous work
- [ ] Disabled states correct

**Report back:**
- "TASK 13: PASS - Pagination works"
- OR "TASK 13: N/A - Less than 50 notes"
- OR "TASK 13: FAIL - [describe issue]"

---

## TASK 14: Test Retry Failed Processing

**Pre-requisite:** A note with FAILED status (may need to create one by temporarily disabling worker)

**Instructions:**
1. Locate a note with red "FAILED" status badge
2. Look for retry button (circular arrow icon next to status)
3. Click retry button
4. Observe behavior

**Expected Behavior:**
- Status changes to PENDING (yellow)
- ProcessingIndicator starts polling again
- If worker is running, should process successfully
- Status updates to COMPLETED (green)

**Verify:**
- [ ] Retry button exists on failed notes
- [ ] Clicking retry triggers new processing
- [ ] Status updates correctly

**Report back:**
- "TASK 14: PASS - Retry works"
- OR "TASK 14: N/A - No failed notes to test"
- OR "TASK 14: FAIL - [describe issue]"

---

## TASK 15: Check Console for Errors

**Instructions:**
1. Open DevTools (F12)
2. Navigate to Console tab
3. Review all messages

**Verify:**
- [ ] No uncaught errors
- [ ] No 404 network errors
- [ ] No CORS errors
- [ ] No authentication errors
- [ ] Only expected API calls (GET /api/notes, POST /api/notes, etc.)

**Report back:**
- "TASK 15: PASS - No console errors"
- OR "TASK 15: FAIL - [list all errors]"
- Include screenshots of errors if found

---

## TASK 16: Test Responsive Design (Mobile View)

**Instructions:**
1. Open DevTools (F12)
2. Enable Device Toolbar (Ctrl+Shift+M or Cmd+Shift+M)
3. Select iPhone or Android device
4. Navigate through the app

**Test on mobile viewport:**
- [ ] Dashboard loads correctly
- [ ] QuickAdd input is usable
- [ ] Notes list is readable
- [ ] Note cards stack vertically
- [ ] Buttons are tappable (not too small)
- [ ] No horizontal scroll
- [ ] Navigation works

**Report back:**
- "TASK 16: PASS - Mobile responsive"
- OR "TASK 16: FAIL - [describe layout issues]"
- Include mobile screenshots

---

## TASK 17: Verify AI Processing Results (If Worker Running)

**Pre-requisite:** Worker must be running, note must be COMPLETED

**Instructions:**
1. Find a LINK note with COMPLETED status
2. Click to open detail view
3. Scroll to "AI Analysis" section

**Verify the following are populated:**
- [ ] Summary (1-2 paragraphs)
- [ ] Excerpt (2-3 sentences)
- [ ] Key Insights (3-5 bullet points)
- [ ] Topics (3-10 topic tags)
- [ ] Sentiment (positive/negative/neutral/mixed)
- [ ] Metadata (for LINK notes): title, description, image, domain

**Verify content quality:**
- [ ] Summary is relevant to the URL
- [ ] Insights are meaningful
- [ ] Topics are accurate
- [ ] No "undefined" or "null" values

**Report back:**
- "TASK 17: PASS - AI results generated correctly"
- OR "TASK 17: N/A - Worker not running"
- OR "TASK 17: FAIL - [describe missing/incorrect data]"
- Include screenshot of AI Analysis section

---

## Summary Report Template

After completing all applicable tasks, provide summary:

```
BROWSER VALIDATION SUMMARY
--------------------------
Total Tasks: 17
Completed: [X]
Passed: [X]
Failed: [X]
N/A: [X]

PASSED TASKS:
- TASK X: [description]
- ...

FAILED TASKS:
- TASK X: [description] - Reason: [details]
- ...

CRITICAL ISSUES:
1. [Issue description]
2. ...

NON-CRITICAL ISSUES:
1. [Issue description]
2. ...

OVERALL STATUS: PASS / FAIL / PARTIAL

NOTES:
[Any additional observations]
```

---

## Instructions for Antigravity

1. Execute tasks in order (1 → 17)
2. Mark each task as PASS/FAIL/N/A
3. Take screenshots for visual verification
4. Note any unexpected behavior
5. Check browser console for errors during each task
6. Report back with summary using template above

**Environment:**
- Browser: Chrome/Firefox (latest)
- OS: [Your OS]
- Screen resolution: [Your resolution]
- Viewport: Desktop (1920x1080) and Mobile (375x667)
