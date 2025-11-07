# Step 3: Admin Panel Logic Analysis

## How Admin Panel Counts Published Articles

Looking at `/app/admin/page.tsx`:

```typescript
const loadData = () => {
  setDrafts(getDraftArticles())
  setPublishedArticles(getArticles())  // Line 70
}
```

`getArticles()` reads from localStorage key 'portfolio_articles'.

## The Problem

The admin panel shows "Published Articles (18)" but the actual breakdown likely is:
- The localStorage 'portfolio_articles' might have 18 articles
- OR the count is including both published + something else

Let me verify what `initializeDefaultArticles()` does...

## Init Flow

1. `initializeDefaultArticles()` loads from `/data/published.mjs` (14 articles)
2. Stores in localStorage 'portfolio_articles'
3. `initializeDrafts()` loads from `/public/data/drafts.json` (4 articles)
4. Stores in localStorage 'draft-articles'

## Hypothesis

The admin panel screenshot shows "Published Articles (18)" which means:
- User clicked "Publish" on the 4 draft articles in the admin UI
- This moved them from 'draft-articles' localStorage to 'portfolio_articles' localStorage
- Now localStorage has 18 articles (14 original + 4 published drafts)
- But `/data/published.mjs` still only has 14
- So thoughts list page only shows 14

## Conclusion

The 4 articles exist in the user's browser localStorage as "published", but not in the repository files. Need to export localStorage 'portfolio_articles' and sync to `/data/published.mjs`.
