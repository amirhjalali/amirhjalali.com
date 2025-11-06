# Article Visibility Fix - Investigation & Resolution Plan

## Problem Statement
Articles are not appearing on the thoughts list page, but individual article URLs work. Admin panel shows 18 published articles, but thoughts page only shows 14.

## 10-Step Investigation & Fix Plan

### Step 1: Document Current State ✓
- Repository has 14 articles in `/data/published.mjs`
- Repository has 14 articles in `/public/data/published.json`
- Repository has 4 articles in `/public/data/drafts.json`
- Admin panel reports 18 published articles (source unknown)
- Thoughts page displays 14 articles

### Step 2: Analyze Data Sources
- [ ] Check all JSON/MJS files for article data
- [ ] Map which components read from which sources
- [ ] Identify where the discrepancy originates

### Step 3: Investigate Admin Panel Logic
- [ ] Trace how admin panel counts published articles
- [ ] Check if it's merging drafts + published
- [ ] Verify localStorage keys being used

### Step 4: Investigate Thoughts Page Logic
- [ ] Verify what data source thoughts page uses
- [ ] Check if generateStaticParams is limiting articles
- [ ] Test client-side vs server-side rendering

### Step 5: Identify Root Cause
- [ ] Document the exact data flow
- [ ] Identify why counts don't match
- [ ] Determine correct source of truth

### Step 6: Design Fix
- [ ] Determine if drafts should be auto-published
- [ ] Design proper data sync mechanism
- [ ] Plan migration if needed

### Step 7: Implement Fix
- [ ] Update data files if needed
- [ ] Fix component logic if needed
- [ ] Add safeguards against future issues

### Step 8: Test Locally
- [ ] Verify article count matches everywhere
- [ ] Test thoughts page shows all articles
- [ ] Test individual article pages work
- [ ] Test admin panel accuracy

### Step 9: Build & Deploy
- [ ] Run production build
- [ ] Verify static generation
- [ ] Push to GitHub
- [ ] Verify deployment

### Step 10: Document Solution
- [ ] Document what was wrong
- [ ] Document what was fixed
- [ ] Add maintenance notes

## Status: IN PROGRESS
Current Step: 1 ✓ → Moving to Step 2
